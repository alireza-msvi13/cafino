import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DiscountService } from 'src/modules/discount/discount.service';

@Injectable()
export class DiscountListener {
  constructor(private readonly discountService: DiscountService) {}

  @OnEvent('payment.verified', { async: true })
  async handlePaymentVerified(event: { discountId?: string }) {
    if (event.discountId) {
      await this.discountService.incrementUsage(event.discountId);
    }
  }
}
