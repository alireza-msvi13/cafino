import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { PHONE_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { PhoneRegex } from 'src/common/constants/regex.constant';
import { Roles } from 'src/common/enums/role.enum';
import { normalizePhoneNumber } from 'src/common/utils/phone.util';

export class UserPermissionDto {
  @IsNotEmpty({ message: PHONE_ERROR_MESSAGE })
  @Transform(({ value }) => normalizePhoneNumber(value))
  @Matches(PhoneRegex, { message: PHONE_ERROR_MESSAGE })
  @ApiProperty({
    title: 'enter phone number for change permission',
    example: '09375012365',
    nullable: false,
  })
  phone: string;

  @ApiProperty({ enum: Roles })
  @IsEnum(Roles)
  role: Roles = Roles.User;
}
