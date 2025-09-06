import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { OrderSortField } from '../enum/order.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class OrderQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: OrderSortField,
    default: OrderSortField.Newest,
  })
  @IsOptional()
  @IsEnum(OrderSortField)
  sortBy?: OrderSortField = OrderSortField.Newest;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
