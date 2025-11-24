import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  Max,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'text is too long' })
  text: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'ItemId is not valid.' })
  itemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'ParentId is not valid.' })
  parentId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, default: 5, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  star?: number;
}
