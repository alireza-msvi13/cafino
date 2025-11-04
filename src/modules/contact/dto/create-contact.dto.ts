import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PHONE_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { normalizePhoneNumber } from 'src/common/utils/phone.util';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export class CreateContactDto {
  @ApiProperty({ example: 'edward' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'edward@gmail.com' })
  @IsString()
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: PHONE_ERROR_MESSAGE })
  @Transform(({ value }) => normalizePhoneNumber(value))
  @Matches(PhoneRegex, {
    message: PHONE_ERROR_MESSAGE,
  })
  @ApiProperty({
    title: 'enter phone number',
    example: '09375012365',
    nullable: false,
  })
  phone: string;

  @ApiProperty({ example: 'I have a problem with my order...' })
  @IsString()
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MaxLength(1000)
  message: string;
}
