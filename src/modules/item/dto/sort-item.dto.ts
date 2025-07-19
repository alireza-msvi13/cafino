import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { SortByOption } from "src/common/enums/sort-by-option.enum";


export class SortItemDto extends PaginationDto {

  @ApiPropertyOptional({ enum: SortByOption, default: SortByOption.Newest })
  @IsOptional()
  @IsEnum(SortByOption)
  sortBy?: SortByOption;


  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minPrice?: number;


  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ type: "boolean", default: false })
  @IsOptional()
  availableOnly?: boolean = false;
}
