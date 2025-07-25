import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { OrderStatus } from "src/common/enums/order-status.enum";

export class OrderStatusDto {
    @ApiProperty({ enum: OrderStatus, default: OrderStatus.Pending })
    @IsEnum(OrderStatus)
    status: string;
}