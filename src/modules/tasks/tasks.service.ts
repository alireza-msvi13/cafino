import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiscountJob } from './jobs/discount.job';
import { OrderJob } from './jobs/order.job';

@Injectable()
export class TasksService {
  constructor(
    private readonly discountJob: DiscountJob,
    private readonly orderJob: OrderJob,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async MidNightCron() {
    await this.discountJob.handleDiscountExpiration();
  }

  @Cron('*/15 * * * *')
  async Every15MinCron() {
    await this.orderJob.autoCancelStaleOrders();
  }
}
