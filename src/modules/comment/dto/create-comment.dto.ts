import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'text cannot be empty' })
  @MaxLength(200, { message: 'text is too long' })
  text: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'itemId is not valid' })
  itemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'parentId is not valid' })
  parentId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, default: 5, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  star?: number;
}
