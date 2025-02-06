import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DiscountEntity} from "./entity/discount.entity";
import {DiscountService} from "./discount.service";
import {DiscountController} from "./discount.controller";

@Module({
  imports: [TypeOrmModule.forFeature([DiscountEntity])],
  providers: [DiscountService],
  controllers: [DiscountController],
  exports: [DiscountService],
})
export class DiscountModule {}
