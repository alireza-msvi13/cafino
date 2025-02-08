import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @MaxLength(200)
    text: string;
    @ApiProperty()
    @IsUUID('4', { message: "itemId is not valid" })
    itemId: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID('4', { message: "itemId is not valid" })
    parentId: string
}