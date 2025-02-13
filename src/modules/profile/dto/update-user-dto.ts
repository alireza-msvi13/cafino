import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateUserDto {

    @ApiProperty({ required: false })
    @IsOptional()
    username?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    first_name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    last_name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    birthday?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    email?: string;
}