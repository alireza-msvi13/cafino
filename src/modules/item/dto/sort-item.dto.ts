import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { SortByOption } from "src/common/enums/sort-by-option.enum";
import { Transform, Type } from "class-transformer";

export class SortItemDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SortByOption, default: SortByOption.Newest })
  @IsOptional()
  @IsEnum(SortByOption)
  sortBy?: SortByOption;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ type: 'boolean', default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return false;
  })
  @IsBoolean()
  availableOnly?: boolean;
}
