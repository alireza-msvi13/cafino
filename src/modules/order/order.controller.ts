import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { OrderService } from './order.service';
import { OrderStatusDto } from './dto/order-status.dto';
import { OrderQueryDto } from './dto/sort-order.dto';
import {
  ChangeOrderStatusDoc,
  GetAllOrdersDoc,
} from './decorators/swagger.decorators';

@Controller('order')
@ApiTags('Order')
@UseGuards(JwtGuard, AdminGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('/status')
  @ChangeOrderStatusDoc()
  changeOrderStatusByAdmin(
    @Body() orderStatusDto: OrderStatusDto,
    @Query('id') orderId: string,
  ) {
    return this.orderService.changeOrderStatusByAdmin(
      orderId,
      orderStatusDto.status,
    );
  }
  @Get()
  @GetAllOrdersDoc()
  getAllOrders(@Query() orderQueryDto: OrderQueryDto) {
    return this.orderService.getAllOrders(orderQueryDto);
  }
}
