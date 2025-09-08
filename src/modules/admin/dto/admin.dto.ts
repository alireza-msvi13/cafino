import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class SalesReportDto {
  @ApiPropertyOptional({
    description: 'Start date (ISO string)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO string)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  end?: string;
}
