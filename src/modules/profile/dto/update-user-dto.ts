import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, Max, Min } from "class-validator";

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Min(1)
    @Max(100)
    username: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Min(1)
    @Max(100)
    first_name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Min(1)
    @Max(100)
    last_name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Max(100)
    birthday: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email: string;
}