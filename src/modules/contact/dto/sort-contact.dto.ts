import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SortContactOption } from '../enum/contact.enum';
import { Transform } from 'class-transformer';
import { PHONE_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { normalizePhoneNumber } from 'src/common/utils/phone.util';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export class ContactQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: SortContactOption,
    default: SortContactOption.Newest,
  })
  @IsOptional()
  @IsEnum(SortContactOption)
  sortBy?: SortContactOption = SortContactOption.Newest;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(100)
  identifier?: string;

  @ApiPropertyOptional({ description: 'Filter by name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by email' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiPropertyOptional({
    title: 'enter phone number',
    nullable: false,
    description: 'Filter by phone',
  })
  @Transform(({ value }) => normalizePhoneNumber(value))
  @IsOptional()
  @Matches(PhoneRegex, { message: PHONE_ERROR_MESSAGE })
  phone?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'true';
    }
    return value;
  })
  @IsOptional()
  @IsBoolean()
  hasReply?: boolean;
}
