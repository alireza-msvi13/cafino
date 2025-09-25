import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddMessageDto {
  @ApiProperty({ example: 'This is a message' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
