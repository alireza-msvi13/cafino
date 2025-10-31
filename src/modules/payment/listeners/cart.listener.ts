import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CartService } from 'src/modules/cart/cart.service';

@Injectable()
export class CartListener {
  constructor(private readonly cartService: CartService) {}

  @OnEvent('payment.verified', { async: true })
  async handlePaymentVerified(event: { userId?: string }) {
    if (event.userId) {
      await this.cartService.clearUserCart(event.userId);
    }
  }
}
