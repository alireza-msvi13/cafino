import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsPhoneNumber,
  Length,
  Matches,
} from "class-validator";
import { Transform } from "class-transformer";

const errorMessage = "phone number is not correct";

export class VerifyOtpDto {
  @IsNotEmpty({ message: errorMessage })
  @Transform(({ value }) =>
    value.replace(/\s+/g, "").replace(/^(\+98|0098|98)/, "0")
  )
  @IsPhoneNumber("IR", { message: errorMessage })
  @Length(11, 11, { message: "phone number must be 11 digits" })
  @ApiProperty({
    title: "enter phone number for login",
    example: "09375012365",
    nullable: false,
  })
  phone: string;

  @IsNotEmpty({ message: "otp code is required" })
  @Length(5, 5, { message: "otp code must be exactly 5 digits" })
  @Matches(/^\d+$/, { message: "otp code must be numeric" })
  @ApiProperty({
    type: "string",
    example: "12345",
  })
  otpCode: string;
}
