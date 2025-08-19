import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum } from "class-validator";
import { OrderSortField } from "../enum/order.enum";
import { OrderStatus } from "src/common/enums/order-status.enum";
import { SortOrder } from "src/modules/contact/enum/contact.enum";
import { PaginationDto } from "src/common/dto/pagination.dto";


export class OrderQueryDto extends PaginationDto {
    @ApiPropertyOptional({ enum: OrderSortField })
    @IsOptional()
    @IsEnum(OrderSortField)
    sortBy?: OrderSortField;

    @ApiPropertyOptional({ enum: SortOrder })
    @IsOptional()
    order?: SortOrder;

    @ApiPropertyOptional({ enum: OrderStatus })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}
