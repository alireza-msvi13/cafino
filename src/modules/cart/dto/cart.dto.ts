import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CartDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'itemId is not valid' })
  itemId: string;
}
