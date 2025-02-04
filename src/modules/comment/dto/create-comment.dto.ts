import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @MaxLength(200)
    text: string;
    @ApiProperty()
    @IsString()
    itemId: string;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId: string
}