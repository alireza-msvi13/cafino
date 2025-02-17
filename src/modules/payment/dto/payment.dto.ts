import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsUUID, MaxLength } from "class-validator";

export class PaymentDto {
  @ApiProperty()
  @IsUUID('4', { message: "addressId is not valid" })
  addressId: string;
  @ApiPropertyOptional()
  @MaxLength(300)
  description?: string;
}