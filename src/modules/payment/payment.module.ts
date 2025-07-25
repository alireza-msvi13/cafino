import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentEntity } from "./entity/payment.entity";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { GatewayModule } from "../gateway/gateway.module";
import { UserModule } from "../user/user.module";
import { CartModule } from "../cart/cart.module";
import { OrderModule } from "../order/order.module";
import { ItemModule } from "../item/item.module";

@Module({
  imports: [
    UserModule,
    CartModule,
    OrderModule,
    GatewayModule,
    ItemModule,
    TypeOrmModule.forFeature([PaymentEntity]),
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [],
})
export class PaymentModule { }
