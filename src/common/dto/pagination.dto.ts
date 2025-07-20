import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class PaginationDto {
    @ApiProperty({ default: 10, description: 'Number of items per page' })
    @Type(() => Number)
    @IsInt({ message: 'limit must be an integer' })
    @Min(1, { message: 'limit must be at least 1' })
    @Max(100, { message: 'limit must not exceed 100' })
    limit: number;

    @ApiProperty({ default: 1, description: 'Page number to retrieve' })
    @Type(() => Number)
    @IsInt({ message: 'page must be an integer' })
    @Min(1, { message: 'page must be at least 1' })
    page: number;
}
