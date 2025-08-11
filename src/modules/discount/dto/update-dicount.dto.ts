import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDiscountDto {
  @ApiPropertyOptional({ type: Boolean })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'true';
    }
    return value;
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
