import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { Response } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { OrderService } from './order.service';
import { OrderStatusDto } from './dto/order-status.dto';
import { SwaggerContentTypes } from 'src/common/enums/swagger.enum';




@Controller('order')
@ApiTags('Order')
@UseGuards(JwtGuard, AdminGuard)
export class OrderController {
  constructor(private orderService: OrderService) { }

  @Post("/status")
  @ApiOperation({ summary: "change order status by admin" })
  @ApiConsumes(SwaggerContentTypes.FORM_URL_ENCODED,SwaggerContentTypes.JSON)
  changeOrderStatusByAdmin(
    @Body() orderStatusDto: OrderStatusDto,
    @Res() response: Response,
    @Query("id") orderId: string,
  ) {
    return this.orderService.changeOrderStatusByAdmin(orderId, orderStatusDto.status, response);
  }
  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "get all orders by admin" })
  getAllOrders(
    @Query() paginationDto: PaginationDto,
    @Res() response: Response,
  ) {
    return this.orderService.getAllOrders(paginationDto, response)
  }

}
