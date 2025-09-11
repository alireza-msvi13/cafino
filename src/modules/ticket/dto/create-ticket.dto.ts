import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Subject of the ticket' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  subject: string;

  @ApiProperty({ example: 'This is a message' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  message: string;
}
