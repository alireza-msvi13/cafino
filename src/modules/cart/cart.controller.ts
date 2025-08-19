import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { CartDto } from './dto/cart.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CartDiscountDto } from './dto/cart-discount.dto';
import { MultiCartDto } from './dto/multi-cart.dto';

@Controller('cart')
@ApiTags('Cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(
    private cartService: CartService
  ) { }



  @Post("add")
  @ApiOperation({ summary: "Add item to cart." })
  async addToCart(
    @Body() cartDto: CartDto,
    @GetUser("id") userId: string
  ) {
    return this.cartService.addToCart(
      cartDto,
      userId
    )
  }

  @Post('add-multiple')
  @ApiOperation({ summary: 'Add multiple items to cart after login.' })
  async addMultipleToCart(
    @Body() multiCartDto: MultiCartDto,
    @GetUser('id') userId: string
  ) {
    return this.cartService.addMultipleToCart(
      multiCartDto,
      userId
    );
  }

  @Get()
  @ApiOperation({ summary: "Get cart." })
  async getCarts(@GetUser("id") userId: string) {
    return this.cartService.getCart(userId)
  }

  @Patch("inc-item")
  @ApiOperation({ summary: "Increment item quantity." })
  async incrementItem(
    @Body() cartDto: CartDto,
    @GetUser("id") userId: string
  ) {
    return this.cartService.incrementItem(
      cartDto,
      userId
    )
  }

  @Patch("dec-item")
  @ApiOperation({ summary: "Decrement item quantity." })
  async decrementItem(
    @Body() cartDto: CartDto,
    @GetUser("id") userId: string
  ) {
    return this.cartService.decrementItem(
      cartDto,
      userId
    )
  }

  @Delete("remove")
  @ApiOperation({ summary: "Remove item from cart." })
  async removeFromCart(
    @Body() removeCartDto: CartDto,
    @GetUser("id") userId: string
  ) {
    return this.cartService.removeFromCart(
      removeCartDto,
      userId,
    )
  }

  @Delete()
  @ApiOperation({ summary: "Delete cart." })
  async deleteCart(
    @GetUser("id") userId: string
  ) {
    return this.cartService.deleteCart(
      userId
    )
  }

  @Post("add-discount")
  @ApiOperation({ summary: "add discount to cart" })
  async addDiscount(
    @Body() cartDiscountDto: CartDiscountDto,
    @GetUser("id") userId: string
  ) {
    return this.cartService.addDiscount(
      cartDiscountDto,
      userId
    )
  }
  @Delete("remove-discount")
  @ApiOperation({ summary: "remove discount to cart" })
  async removeDiscount(
    @Body() cartDiscountDto: CartDiscountDto,
    @GetUser("id") userId: string
  ) {
    return this.cartService.removeDiscount(
      cartDiscountDto,
      userId
    )
  }


}
