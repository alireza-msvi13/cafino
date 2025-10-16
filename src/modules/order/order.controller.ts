import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { OrderService } from './order.service';
import { OrderStatusDto } from './dto/order-status.dto';
import { OrderQueryDto } from './dto/sort-order.dto';
import {
  ChangeOrderStatusDoc,
  GetAllOrdersDoc,
} from './decorators/swagger.decorators';
import { Roles } from 'src/common/enums/role.enum';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('order')
@ApiTags('Order')
@UseGuards(JwtGuard, RolesGuard)
@RolesAllowed(Roles.Admin, Roles.SuperAdmin)
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
