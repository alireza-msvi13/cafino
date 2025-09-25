import { forwardRef, Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entity/cart.entity';
import { ItemModule } from '../item/item.module';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [
    forwardRef(() => DiscountModule),
    ItemModule,
    DiscountModule,
    TypeOrmModule.forFeature([CartEntity]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
