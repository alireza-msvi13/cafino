import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID, MaxLength } from "class-validator";

export class PaymentDto {
  @ApiProperty()
  @IsUUID('4', { message: "addressId is not valid" })
  addressId: string;
  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(300)
  description?: string;
}