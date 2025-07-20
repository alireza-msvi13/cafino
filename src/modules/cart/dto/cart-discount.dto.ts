import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

export class CartDiscountDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100, { message: "discount code is too long" })
    @Transform(({ value }) => value.trim())
    code: string;
}
