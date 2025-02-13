import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class CreateAddressDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    province: string
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    city: string
    @ApiProperty()
    @IsString()
    @MaxLength(500)
    address: string
}