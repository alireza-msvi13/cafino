import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { SortByOption } from "src/modules/item/enum/sort-by-option.enum";
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

  @ApiPropertyOptional({ description: "Slug to filter items by category" })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100, { message: "category title is too long" })
  category: string;

  @ApiPropertyOptional({ description: "Search keyword for title or description or ingredients" })
  @IsOptional()
  @Type(() => String)
  @MinLength(2)
  @MaxLength(100)
  search?: string;


}
