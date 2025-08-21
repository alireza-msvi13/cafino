import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express";
import { Repository } from "typeorm";
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


@Injectable()
export class PaymentService {

  private readonly frontendUrl = process.env.FRONTEND_URL

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private cartService: CartService,
    private zarinpalService: ZarinpalService,
    private orderService: OrderService,
    private userService: UserService,
    private itemService: ItemService,

  ) { }

  async paymentGatewat(paymentDto: PaymentDto, userId: string): Promise<ServerResponse> {
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

      console.log(cart.paymentAmount);
      

      if (!payment.status) {
        const { authority, code, gatewayURL } = await this.zarinpalService.sendRequest({
          amount: cart.paymentAmount,
          description: "PAYMENT ORDER",
          user: { email: user.email, mobile: user.phone },
        });

        payment.authority = authority;

        await this.paymentRepository.save(payment);

        return new ServerResponse(HttpStatus.OK, "Redirect user to payment gateway.", { gatewayURL });
      }

      await this.paymentRepository.save(payment);

      return new ServerResponse(HttpStatus.OK, "Payment completed successfully. No gateway redirection required.");
    } catch (error) {
      console.error("Payment gateway error:", error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);
    }

  }
  async paymentVerify(authority: string, status: string, response: Response) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { authority },
        relations: { order: true, user: true },
      })

      if (!payment) throw new NotFoundException("Payment not found.");
      if (payment.status) throw new ConflictException("Payment already verified.");

      if (status !== "OK") {
        await this.orderService.changeOrderStatus(payment.order.id, OrderStatus.Failed);
        return response.redirect(`${this.frontendUrl}/payment?status=failed`)
      }

      const {
        card_hash,
        card_pan,
        ref_id
      } = await this.zarinpalService.verifyRequest(authority, payment.amount)

      payment.status = true;
      payment.card_hash = card_hash
      payment.card_pan = card_pan
      payment.ref_id = ref_id
      await this.paymentRepository.save(payment);

      await this.orderService.changeOrderStatus(payment.order.id, OrderStatus.Processing);
      await this.itemService.decreaseItemsQuantity(payment.order.id);
      await this.cartService.clearUserCart(payment.user.id);

      return response.redirect(`${this.frontendUrl}/payment?status=success`)

    } catch (error) {
      console.error("Payment verification error:", error);
      return response.redirect(`${this.frontendUrl}/payment?status=failed`);
    }

  }
}
