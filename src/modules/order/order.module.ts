import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-items.entity';
import { UserModule } from '../user/user.module';
import { OrderController } from './order.controller';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
