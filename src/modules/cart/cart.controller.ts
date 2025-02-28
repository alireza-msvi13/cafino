import { Body, Controller, Delete, Get, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { CartDto } from './dto/cart.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CartDiscountDto } from './dto/cart-discount.dto';

@Controller('cart')
@ApiTags('Cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(
    private cartService: CartService
  ) { }



  @Post("add")
  @ApiOperation({ summary: "add item to cart" })
  async addToCart(
    @Body() cartDto: CartDto,
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.addToCart(
      cartDto,
      userId,
      response
    )
  }

  @Get()
  @ApiOperation({ summary: "get carts" })
  async getCarts(
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.getCart(
      userId,
      response
    )
  }

  @Patch("inc-item")
  @ApiOperation({ summary: "increment item quantity" })
  async incrementItem(
    @Body() cartDto: CartDto,
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.incrementItem(
      cartDto,
      userId,
      response
    )
  }

  @Patch("dec-item")
  @ApiOperation({ summary: "decrement item quantity" })
  async decrementItem(
    @Body() cartDto: CartDto,
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.decrementItem(
      cartDto,
      userId,
      response
    )
  }

  @Delete("remove")
  @ApiOperation({ summary: "remove item from cart" })
  async removeFromCart(
    @Body() removeCartDto: CartDto,
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.removeFromCart(
      removeCartDto,
      userId,
      response
    )
  }

  @Delete()
  @ApiOperation({ summary: "delete cart" })
  async deleteCart(
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.deleteCart(
      userId,
      response
    )
  }

  @Post("add-discount")
  @ApiOperation({ summary: "add discount to cart" })
  async addDiscount(
    @Body() cartDiscountDto: CartDiscountDto,
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.addDiscount(
      cartDiscountDto,
      userId,
      response
    )
  }
  @Delete("remove-discount")
  @ApiOperation({ summary: "add discount to cart" })
  async removeDiscount(
    @Body() cartDiscountDto: CartDiscountDto,
    @Res() response: Response,
    @GetUser("id") userId: string
  ): Promise<Response> {
    return this.cartService.removeDiscount(
      cartDiscountDto,
      userId,
      response
    )
  }


}
