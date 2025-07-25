import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { SortCommentOption } from "src/common/enums/sort-comment-option.enum";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class SortCommentDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: SortCommentOption,
    default: SortCommentOption.Newest,
    description: "Sort comments by creation date or rating"
  })
  @IsOptional()
  @IsEnum(SortCommentOption)
  sortBy?: SortCommentOption;
}
