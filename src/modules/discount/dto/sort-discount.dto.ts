import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Transform } from 'class-transformer';
import { DiscountSortField, DiscountSortOrder } from '../enum/discount.enum';



export class DiscountQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        enum: DiscountSortField,
        default: DiscountSortField.CreatedAt,
    })
    @IsOptional()
    @IsEnum(DiscountSortField)
    sortBy?: DiscountSortField = DiscountSortField.CreatedAt;

    @ApiPropertyOptional({
        enum: DiscountSortOrder,
        default: DiscountSortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(DiscountSortOrder)
    order?: DiscountSortOrder = DiscountSortOrder.DESC;


    @ApiPropertyOptional({ type: 'boolean' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim().toLowerCase() === 'true';
        }
        return value;
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
