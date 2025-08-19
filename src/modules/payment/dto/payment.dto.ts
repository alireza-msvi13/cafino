import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class PaymentDto {
  @ApiProperty()
  @IsUUID('4', { message: "addressId is not valid" })
  @IsNotEmpty()
  addressId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
