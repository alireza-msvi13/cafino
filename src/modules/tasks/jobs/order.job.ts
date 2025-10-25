import { Injectable } from '@nestjs/common';
import { ItemService } from 'src/modules/item/item.service';
import { OrderService } from 'src/modules/order/order.service';

@Injectable()
export class OrderJob {
  constructor(
    private orderService: OrderService,
    private itemService: ItemService,
  ) {}

  async autoCancelStaleOrders() {
    const expiredOrders = await this.orderService.findExpiredPendingOrders(15);
    if (!expiredOrders.length) return;

    for (const order of expiredOrders) {
      for (const item of order.items) {
        await this.itemService.increaseQuantity(item.item.id, item.count);
      }
      await this.orderService.cancelOrder(order.id);
    }
  }
}
