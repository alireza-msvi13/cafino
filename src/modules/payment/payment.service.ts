import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ZarinpalService } from '../gateway/zarinpal.service';
import { OrderService } from '../order/order.service';
import { PaymentGatewayDto } from './dto/payment.dto';
import { PaymentEntity } from './entity/payment.entity';
import { CartService } from '../cart/cart.service';
import { generateInvoiceNumber } from 'src/common/utils/generate-invoice-number';
import { UserService } from '../user/user.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ItemService } from '../item/item.service';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { OrderEntity } from '../order/entity/order.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    private readonly cartService: CartService,
    private readonly zarinpalService: ZarinpalService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly itemService: ItemService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async paymentGateway(
    paymentGatewayDto: PaymentGatewayDto,
    userId: string,
  ): Promise<ServerResponse> {
    const { addressId, description } = paymentGatewayDto;

    const user = await this.userService.findUser(userId, ['addressList']);
    if (!user)
      throw new NotFoundException('Order creation failed: user not found.');

    const address = user.addressList.find((a) => a.id === addressId);
    if (!address) throw new NotFoundException('Address not found');

    const cart = await this.cartService.getUserCart(userId);
    if (!cart.cartItems.length) {
      throw new ConflictException('Order creation failed: cart is empty.');
    }

    const paymentAmount = cart.paymentAmount;
    const isFreeOrder = paymentAmount === 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let payment: PaymentEntity;
    let order: OrderEntity;

    try {
      await this.itemService.validateAndDecrementStock(
        cart.cartItems,
        queryRunner.manager,
      );

      order = await this.orderService.create(
        cart,
        userId,
        addressId,
        description,
        queryRunner.manager,
      );

      payment = this.paymentRepository.create({
        amount: paymentAmount,
        order: { id: order.id },
        status: isFreeOrder,
        user: { id: userId },
        invoice_number: generateInvoiceNumber(),
        authority: null,
      });

      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // console.error('Payment DB transaction error:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'An error occurred during order creation.',
      );
    } finally {
      await queryRunner.release();
    }

    if (isFreeOrder) {
      await this.orderService.changeOrderStatus(
        payment.order.id,
        OrderStatus.Processing,
      );

      return new ServerResponse(
        HttpStatus.OK,
        'Payment completed successfully. No gateway redirection required.',
        { gatewayURL: null },
      );
    }

    try {
      const { authority, gatewayURL } = await this.zarinpalService.sendRequest({
        amount: paymentAmount,
        description: `Payment for Order #${order.id}`,
        user: { email: user.email, mobile: user.phone },
      });

      await this.paymentRepository.update(payment.id, { authority });

      return new ServerResponse(
        HttpStatus.OK,
        'Redirect user to payment gateway.',
        { gatewayURL },
      );
    } catch (error) {
      // console.error('Zarinpal request error:', error);
      throw new ServiceUnavailableException(
        'Order created, but failed to connect to payment gateway. Please try paying from your order history.',
      );
    }
  }
  async paymentVerify(authority: string, status: string) {
    const payment = await this.findPaymentForVerification(authority);

    if (!payment) return { success: false, message: 'Payment not found.' };
    if (payment.status) return { success: false, message: 'Already verified.' };
    if (status !== 'OK') {
      await this.orderService.changeOrderStatus(
        payment.order.id,
        OrderStatus.Failed,
      );
      return { success: false, message: 'Payment failed.' };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const { card_hash, card_pan, ref_id } =
        await this.zarinpalService.verifyRequest(authority, payment.amount);

      await queryRunner.startTransaction();

      payment.status = true;
      payment.card_hash = card_hash;
      payment.card_pan = card_pan;
      payment.ref_id = ref_id;
      await queryRunner.manager.save(payment);

      await this.orderService.changeOrderStatus(
        payment.order.id,
        OrderStatus.Processing,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('payment.verified', {
        orderId: payment.order.id,
        discountId: payment.order.discount?.id,
        userId: payment.user.id,
      });

      return { success: true, message: 'Payment successful.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'An error occurred during payment verification.',
      };
    } finally {
      await queryRunner.release();
    }
  }

  // * helper

  private async findPaymentForVerification(authority: string) {
    return await this.paymentRepository.findOne({
      where: { authority },
      relations: { order: { discount: true }, user: true },
      select: {
        id: true,
        amount: true,
        status: true,
        authority: true,
        card_hash: true,
        card_pan: true,
        ref_id: true,
        order: { id: true, discount: { id: true, active: true } },
        user: { id: true },
      },
    });
  }
}
