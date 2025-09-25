import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CartDiscountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'discount code is too long' })
  @Transform(({ value }) => value.trim())
  code: string;
}
