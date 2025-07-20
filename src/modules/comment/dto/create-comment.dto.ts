import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";


export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: "text cannot be empty" })
  @MaxLength(200, { message: "text is too long" })
  text: string;

  @ApiProperty()
  @IsUUID('4', { message: "itemId is not valid" })
  itemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: "parentId is not valid" })
  parentId: string;
}
