import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class DiscountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Code must not be empty' })
  @MaxLength(100, { message: 'Code must be at most 100 characters' })
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'percent must be a number' })
  @Min(1, { message: 'percent must be at least 1' })
  @Max(100, { message: 'percent must not exceed 100' })
  percent: number;

  @ApiPropertyOptional({ default: 1_000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a number' })
  @Min(1_000, { message: 'amount must be at least 1000' })
  @Max(1_000_000, { message: 'amount must not exceed 1,000,000' })
  amount: number;

  @ApiPropertyOptional({ description: 'expires in days', default: 20 })
  @IsNotEmpty({ message: 'expires_in must not be empty' })
  @Type(() => Number)
  @IsNumber({}, { message: 'expires_in must be a number' })
  @Min(1, { message: 'expires_in must be at least 1 day' })
  @Max(10_000, { message: 'expires_in must not exceed 10,000 days' })
  expires_in: number;

  @ApiPropertyOptional()
  @IsNotEmpty({ message: 'limit must not be empty' })
  @Type(() => Number)
  @IsNumber({}, { message: 'limit must be a number' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must not exceed 100' })
  limit: number;
}
