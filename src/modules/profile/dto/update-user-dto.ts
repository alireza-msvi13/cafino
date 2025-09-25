import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // @IsNotEmpty()
  // @MaxLength(100)
  // username: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthday: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // @IsEmail()
  // email: string;
}
