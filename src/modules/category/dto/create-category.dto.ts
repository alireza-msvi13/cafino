import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  slug: string;
  @ApiProperty({ format: "binary" })
  image: string;
  @ApiProperty({ type: "boolean", default: true })
  show: boolean;
}
