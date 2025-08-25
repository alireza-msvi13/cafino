import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ZarinpalService } from "../gateway/zarinpal.service";
import { OrderService } from "../order/order.service";
import { PaymentDto } from "./dto/payment.dto";
import { PaymentEntity } from "./entity/payment.entity";
import { CartService } from "../cart/cart.service";
import { generateInvoiceNumber } from "src/common/utils/generate-invoice-number";
import { UserService } from "../user/user.service";
import { OrderStatus } from "src/common/enums/order-status.enum";
import { ItemService } from "../item/item.service";
import { ServerResponse } from "src/common/dto/server-response.dto";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "src/common/constants/error.constant";
import { DiscountService } from "../discount/discount.service";


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
    private readonly discountService: DiscountService,
    private readonly dataSource: DataSource,

  ) { }

  async paymentGateway(paymentDto: PaymentDto, userId: string): Promise<ServerResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { addressId, description } = paymentDto;

      const user = await this.userService.findUserById(userId);
      const cart = await this.cartService.getUserCart(userId);


      await Promise.all(
        cart.cartItems.map(item =>
          this.itemService.checkItemQuantity(item.itemId, item.count)
        )
      );

      const order = await this.orderService.create(cart, userId, addressId, description);


      const payment = this.paymentRepository.create({
        amount: cart.paymentAmount,
        order: { id: order.id },
        status: cart.paymentAmount === 0,
        user: { id: userId },
        invoice_number: generateInvoiceNumber(),
      });


      if (payment.status) {
        await queryRunner.manager.save(payment);
        await queryRunner.commitTransaction();
        return new ServerResponse(HttpStatus.OK, "Payment completed successfully. No gateway redirection required.");
      }


      const { authority, code, gatewayURL } = await this.zarinpalService.sendRequest({
        amount: cart.paymentAmount,
        description: "PAYMENT ORDER",
        user: { email: user.email, mobile: user.phone },
      });

      payment.authority = authority;
      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();
      return new ServerResponse(HttpStatus.OK, "Redirect user to payment gateway.", { gatewayURL });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Payment gateway error:", error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("An error occurred during payment processing.");
    } finally {
      await queryRunner.release();
    }
  }
  async paymentVerify(authority: string, status: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(PaymentEntity, {
        where: { authority },
        relations: {
          order: { discount: true },
          user: true,
        },
        select: {
          id: true,
          amount: true,
          status: true,
          authority: true,
          card_hash: true,
          card_pan: true,
          ref_id: true,
          order: {
            id: true,
            discount: {
              id: true,
              active: true,
            },
          },
          user: {
            id: true,
          },
        },
      });

      if (!payment) return { success: false, message: "Payment not found." };
      if (payment.status) return { success: false, message: "Payment already verified." };

      if (status !== "OK") {
        await this.orderService.changeOrderStatus(payment.order.id, OrderStatus.Failed);
        await queryRunner.rollbackTransaction();
        return { success: false, message: "Payment failed." };
      }

      const { card_hash, card_pan, ref_id } = await this.zarinpalService.verifyRequest(authority, payment.amount);

      payment.status = true;
      payment.card_hash = card_hash;
      payment.card_pan = card_pan;
      payment.ref_id = ref_id;
      await queryRunner.manager.save(payment);


      if (payment.order.discount?.active) {
        await this.discountService.incrementUsage(payment.order.discount.id);
      }

      await this.orderService.changeOrderStatus(payment.order.id, OrderStatus.Processing);
      await this.itemService.decreaseItemsQuantity(payment.order.id);
      await this.cartService.clearUserCart(payment.user.id);

      await queryRunner.commitTransaction();
      return { success: true, message: "Payment successful." };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Payment verification error:", error);
      return { success: false, message: "An error occurred during payment verification." };
    } finally {
      await queryRunner.release();
    }
  }

}
