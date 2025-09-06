import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Transform } from 'class-transformer';
import { DiscountSortField } from '../enum/discount.enum';

export class DiscountQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: DiscountSortField,
    default: DiscountSortField.Newest,
  })
  @IsOptional()
  @IsEnum(DiscountSortField)
  sortBy?: DiscountSortField = DiscountSortField.Newest;

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
