import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entity/discount.entity';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    forwardRef(() => CartModule),
    TypeOrmModule.forFeature([DiscountEntity]),
    ScheduleModule.forRoot(),
  ],
  providers: [DiscountService],
  controllers: [DiscountController],
  exports: [DiscountService],
})
export class DiscountModule {}
