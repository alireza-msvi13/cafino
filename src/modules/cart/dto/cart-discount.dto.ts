import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class CartDiscountDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    code: string;
}