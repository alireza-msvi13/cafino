import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CartDto {
    @ApiProperty()
    @IsUUID('4', { message: "itemId is not valid" })
    itemId: string;
}