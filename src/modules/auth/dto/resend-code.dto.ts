import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { PHONE_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { normalizePhoneNumber } from 'src/common/utils/phone.util';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export class ResendCodeDto {
  @IsNotEmpty({ message: PHONE_ERROR_MESSAGE })
  @Transform(({ value }) => normalizePhoneNumber(value))
  @Matches(PhoneRegex, { message: PHONE_ERROR_MESSAGE })
  @ApiProperty({
    title: 'enter phone number for login',
    example: '09375012365',
    nullable: false,
  })
  phone: string;

  @IsNotEmpty({ message: 'Captcha token is required' })
  @ApiProperty({
    title: 'Google reCAPTCHA v2 token',
    nullable: false,
  })
  captchaToken: string;
}
