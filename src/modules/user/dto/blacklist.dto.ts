import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class BlackListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Id is not valid.' })
  id: string;
}
