import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { SortByOption } from "src/common/enums/sort-by-option.enum";
import { Transform } from "class-transformer";

export class SortItemDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SortByOption, default: SortByOption.Newest })
  @IsOptional()
  @IsEnum(SortByOption)
  sortBy?: SortByOption;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
  maxPrice?: number;

  @ApiPropertyOptional({ type: 'boolean', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return false;
  })
  availableOnly?: boolean;
}
