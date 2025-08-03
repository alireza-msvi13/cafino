import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ContactSortField, SortOrder } from '../enum/contact.enum';
import { Transform } from 'class-transformer';
import { PHONE_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { normalizePhoneNumber } from 'src/common/utils/phone.util';



export class ContactQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        enum: ContactSortField,
        default: ContactSortField.CreatedAt,
    })
    @IsOptional()
    @IsEnum(ContactSortField)
    sortBy?: ContactSortField = ContactSortField.CreatedAt;

    @ApiPropertyOptional({
        enum: SortOrder,
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    order?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({ description: 'Filter by name' })
    @Transform(({ value }) => typeof value === 'string' ? value.replace(/[^a-zA-Z0-9آ-ی ]/g, '') : value)
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ description: 'Filter by email' })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email address' })
    email?: string;

    @ApiPropertyOptional({
        title: "enter phone number",
        nullable: false,
        description: 'Filter by phone'
    })
    @Transform(({ value }) => normalizePhoneNumber(value))
    @IsOptional()
    @Matches(/^09\d{9}$/, { message: PHONE_ERROR_MESSAGE })
    phone?: string;

    @ApiPropertyOptional({ type: 'boolean' })
    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
        return false;
    })
    @IsOptional()
    @IsBoolean()
    hasReply?: boolean;
}
