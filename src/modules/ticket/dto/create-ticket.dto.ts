import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Subject of the ticket' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subject: string;

  @ApiProperty({ example: 'This is a message' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
