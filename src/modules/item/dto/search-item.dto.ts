import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { MinLength, MaxLength } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";


export class SearchItemDto extends PaginationDto {
    @ApiPropertyOptional({ description: "Search keyword for title or description or ingredients" })
    @Type(() => String)
    @MinLength(2)
    @MaxLength(100)
    search?: string;
}