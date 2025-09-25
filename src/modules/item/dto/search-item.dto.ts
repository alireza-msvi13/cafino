import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaxLength, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchItemDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search keyword for title or description or ingredients',
  })
  @IsOptional()
  @MaxLength(100)
  search?: string;
}
