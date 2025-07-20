import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from "class-validator";

class SingleCartDto {
    @ApiProperty()
    @IsUUID('4', { message: "itemId is not valid" })
    itemId: string;

    @ApiProperty({ default: 1 })
    @IsInt()
    @Min(1)
    count: number;
}

export class MultiCartDto {
    @ApiProperty({ type: [SingleCartDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SingleCartDto)
    items: SingleCartDto[];
}
