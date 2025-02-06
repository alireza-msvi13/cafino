import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class CartDto {
    @ApiProperty()
    @IsString()
    @Length(36)
    itemId: string;
}