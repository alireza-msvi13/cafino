import { Injectable } from '@nestjs/common';
import { DiscountService } from 'src/modules/discount/discount.service';

@Injectable()
export class DiscountJob {
  constructor(private discountService: DiscountService) {}

  async handleDiscountExpiration() {
    await this.discountService.deactivateExpiredDiscounts();
  }
}
