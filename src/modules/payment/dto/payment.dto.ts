import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class PaymentGatewayDto {
  @ApiProperty()
  @IsUUID('4', { message: 'AddressId is not valid.' })
  @IsNotEmpty()
  addressId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
export class PaymentVerifyDto {
  @IsString()
  @IsNotEmpty()
  @Length(36, 36, { message: 'Authority is not valid.' })
  Authority: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['OK', 'NOK'], { message: 'Status is not valid.' })
  Status: string;
}
