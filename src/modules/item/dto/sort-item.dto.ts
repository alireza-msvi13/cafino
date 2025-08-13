import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsUUID } from "class-validator";
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
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'true';
    }
    return value;
  })
  @IsBoolean()
  availableOnly?: boolean;


  @ApiPropertyOptional({ description: "Category ID to filter items by category" })
  @IsOptional()
  @Type(() => String)
  @IsUUID('4', { message: "itemId is not valid" })
  categoryId?: string;

  @ApiPropertyOptional({ description: "Search keyword for title or description or ingredients" })
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/[^a-zA-Z0-9آ-ی ]/g, '') : value)
  @IsOptional()
  @Type(() => String)
  search?: string;


}
