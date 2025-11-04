import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { PHONE_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { normalizePhoneNumber } from 'src/common/utils/phone.util';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export class VerifyOtpDto {
  @IsNotEmpty({ message: PHONE_ERROR_MESSAGE })
  @Transform(({ value }) => normalizePhoneNumber(value))
  @Matches(PhoneRegex, {
    message: PHONE_ERROR_MESSAGE,
  })
  @ApiProperty({
    title: 'enter phone number for login',
    example: '09375012365',
    nullable: false,
  })
  phone: string;

  @IsNotEmpty({ message: 'otp code is required' })
  @Length(5, 5, { message: 'otp code must be exactly 5 digits' })
  @IsNumberString({}, { message: 'otp code must be number' })
  @ApiProperty({
    type: 'string',
    example: '12345',
  })
  otpCode: string;
}
