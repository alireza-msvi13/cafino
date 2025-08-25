import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DiscountEntity} from "./entity/discount.entity";
import {DiscountService} from "./discount.service";
import {DiscountController} from "./discount.controller";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscountEntity]),
    ScheduleModule.forRoot(),
  ],
  providers: [DiscountService],
  controllers: [DiscountController],
  exports: [DiscountService],
})
export class DiscountModule {}
