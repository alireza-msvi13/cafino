import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { DiscountModule } from '../discount/discount.module';
import { ItemModule } from '../item/item.module';
import { DiscountJob } from './jobs/discount.job';
import { OrderJob } from './jobs/order.job';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [DiscountModule, ItemModule, OrderModule],
  providers: [TasksService, DiscountJob, OrderJob],
})
export class TasksModule {}
