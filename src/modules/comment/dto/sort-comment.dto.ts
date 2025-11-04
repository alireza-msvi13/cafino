import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SortCommentOption } from '../enum/comment.enum';
import { Transform, Type } from 'class-transformer';
import { PHONE_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { normalizePhoneNumber } from 'src/common/utils/phone.util';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export class SortCommentDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: SortCommentOption,
    default: SortCommentOption.Newest,
    description: 'Sort comments by creation date or rating',
  })
  @IsOptional()
  @IsEnum(SortCommentOption)
  sortBy?: SortCommentOption;
}
export class SortAdminCommentDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: SortCommentOption,
    default: SortCommentOption.Newest,
  })
  @IsEnum(SortCommentOption)
  @IsOptional()
  sortBy?: SortCommentOption = SortCommentOption.Newest;

  @ApiPropertyOptional({ type: 'boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'true';
    }
    return value;
  })
  @IsOptional()
  @IsBoolean()
  accept?: boolean;

  @ApiPropertyOptional()
  @IsUUID('4', { message: 'ItemId is not valid.' })
  @IsOptional()
  itemId?: string;

  @ApiPropertyOptional()
  @IsUUID('4', { message: 'UserId is not valid.' })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    title: 'enter phone number',
    nullable: false,
    description: 'Filter by phone',
  })
  @Transform(({ value }) => normalizePhoneNumber(value))
  @IsOptional()
  @Matches(PhoneRegex, { message: PHONE_ERROR_MESSAGE })
  phone?: string;
}
