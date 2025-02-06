import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsString, Length, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  title: string;
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  slug: string;
  @ApiProperty({ format: "binary" })
  image: string;
  @ApiProperty({ type: "boolean", default: true })
  @Length(4, 5)
  show: boolean;
}
