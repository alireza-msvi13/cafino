import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, Length } from "class-validator";
import { Transform } from "class-transformer";

const errorMessage = "phone number is not correct";

export class ResendCodeDto {
  @IsNotEmpty({ message: errorMessage })
  @Transform(({ value }) =>
    value.replace(/\s+/g, '').replace(/^(\+98|0098|98)/, '0')
  )
  @IsPhoneNumber('IR', { message: errorMessage })
  @Length(11, 11, { message: "phone number must be 11 digits" })
  @ApiProperty({
    title: "enter phone number for login",
    example: "09375012365",
    nullable: false,
  })
  phone: string;
}
