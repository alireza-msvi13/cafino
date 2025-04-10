import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express";
import { Repository } from "typeorm";
import { ZarinpalService } from "../gateway/zarinpal.service";
import { OrderService } from "../order/order.service";
import { PaymentDto } from "./dto/payment.dto";
import { PaymentEntity } from "./entity/payment.entity";
import { CartService } from "../cart/cart.service";
import { generateInvoiceNumber } from "src/common/utils/generate-invoice-number";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "src/common/constants/error.constant";
import { UserService } from "../user/user.service";
import { OrderStatus } from "src/common/enums/order-status.enum";


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
  ) { }

  async paymentGatewat(paymentDto: PaymentDto, userId: string, response: Response) {

    try {
      const { addressId, description } = paymentDto;
      const user = await this.userService.findUserById(userId);
      const cart = await this.cartService.getUserCart(userId);
      const order = await this.orderService.create(cart, userId, addressId, description);

      const payment = this.paymentRepository.create({
        amount: cart.paymentAmount,
        order: { id: order.id },
        status: cart.paymentAmount === 0,
        user: { id: userId },
        invoice_number: generateInvoiceNumber(),
      });

      if (!payment.status) {

        const { authority, code, gatewayURL } = await this.zarinpalService.sendRequest({
          amount: cart.paymentAmount,
          description: "PAYMENT ORDER",
          user: { email: user.email, mobile: user.phone },
        });

        payment.authority = authority;
        await this.paymentRepository.save(payment);

        return response.status(HttpStatus.OK).json({
          gatewayURL,
          statusCode: HttpStatus.OK,
        })
      }

      await this.paymentRepository.save(payment);

      return response.status(HttpStatus.OK).json({
        data: "Payment Done Successfully",
        statusCode: HttpStatus.OK,
      })

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          INTERNAL_SERVER_ERROR_MESSAGE,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
  async paymentVerify(authority: string, status: string, response: Response) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { authority },
        relations: { order: true , user: true},
      })

      if (!payment) throw new NotFoundException();
      if (payment.status) throw new ConflictException();

      if (status !== "OK") {
        await this.orderService.changeOrderStatus(payment.order.id,OrderStatus.Failed);
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

      await this.orderService.changeOrderStatus(payment.order.id,OrderStatus.Processing);
      await this.cartService.clearUserCart(payment.user.id);

      return response.redirect(`${this.frontendUrl}/payment?status=success`)

    } catch (error) {
      console.error("Payment verification error:", error);
      return response.redirect(`${this.frontendUrl}/payment?status=failed`);
    }

  }
}
