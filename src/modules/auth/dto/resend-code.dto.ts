import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches } from "class-validator";
import { Transform } from "class-transformer";
import { PHONE_ERROR_MESSAGE } from "src/common/constants/error.constant";
import { normalizePhoneNumber } from "src/common/utils/phone.util";

export class ResendCodeDto {
  @IsNotEmpty({ message: PHONE_ERROR_MESSAGE })
  @Transform(({ value }) => normalizePhoneNumber(value))
  @Matches(/^09\d{9}$/, { message: PHONE_ERROR_MESSAGE })
  @ApiProperty({
    title: "enter phone number for login",
    example: "09375012365",
    nullable: false,
  })
  phone: string;
}
