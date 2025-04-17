import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsOptional, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @MinLength(5)
    @MaxLength(100)
    username: string;

    @ApiPropertyOptional()
    @IsOptional()
    @MinLength(1)
    @MaxLength(100)
    first_name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @MinLength(1)
    @MaxLength(100)
    last_name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    birthday: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email: string;
}