import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { CartDto } from './dto/cart.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CartDiscountDto } from './dto/cart-discount.dto';
import { MultiCartDto } from './dto/multi-cart.dto';
import {
  AddDiscountDoc,
  AddMultiItemToCartDoc,
  AddToCartDoc,
  DecrementItemDoc,
  DeleteCartDoc,
  GetCartDoc,
  IncrementItemDoc,
  RemoveDiscountDoc,
  RemoveItemFromCartDoc,
} from './decorators/swagger.decorators';

@Controller('cart')
@ApiTags('Cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('add')
  @AddToCartDoc()
  async addToCart(@Body() cartDto: CartDto, @GetUser('id') userId: string) {
    return this.cartService.addToCart(cartDto, userId);
  }

  @Post('add-multiple')
  @AddMultiItemToCartDoc()
  async addMultipleToCart(
    @Body() multiCartDto: MultiCartDto,
    @GetUser('id') userId: string,
  ) {
    return this.cartService.addMultipleToCart(multiCartDto, userId);
  }

  @Get()
  @GetCartDoc()
  async getCart(@GetUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Patch('inc-item')
  @IncrementItemDoc()
  async incrementItem(@Body() cartDto: CartDto, @GetUser('id') userId: string) {
    return this.cartService.incrementItem(cartDto, userId);
  }

  @Patch('dec-item')
  @DecrementItemDoc()
  async decrementItem(@Body() cartDto: CartDto, @GetUser('id') userId: string) {
    return this.cartService.decrementItem(cartDto, userId);
  }

  @Delete('remove')
  @RemoveItemFromCartDoc()
  async removeFromCart(
    @Body() removeCartDto: CartDto,
    @GetUser('id') userId: string,
  ) {
    return this.cartService.removeFromCart(removeCartDto, userId);
  }

  @Delete()
  @DeleteCartDoc()
  async deleteCart(@GetUser('id') userId: string) {
    return this.cartService.deleteCart(userId);
  }

  @Post('add-discount')
  @AddDiscountDoc()
  async addDiscount(
    @Body() cartDiscountDto: CartDiscountDto,
    @GetUser('id') userId: string,
  ) {
    return this.cartService.addDiscount(cartDiscountDto, userId);
  }

  @Delete('remove-discount')
  @RemoveDiscountDoc()
  async removeDiscount(
    @Body() cartDiscountDto: CartDiscountDto,
    @GetUser('id') userId: string,
  ) {
    return this.cartService.removeDiscount(cartDiscountDto, userId);
  }
}
