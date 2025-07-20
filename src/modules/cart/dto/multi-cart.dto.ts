import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsUUID, Max, Min, ValidateNested } from "class-validator";

class SingleCartDto {
  @ApiProperty()
  @IsUUID('4', { message: "itemId is not valid" })
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: "count is too large" })
  count: number;
}

export class MultiCartDto {
  @ApiProperty({ type: [SingleCartDto] })
  @IsArray()
  @ArrayMaxSize(100, { message: "you cannot add more than 100 items" })
  @ArrayMinSize(1, { message: "at least one item is required" })
  @ValidateNested({ each: true })
  @Type(() => SingleCartDto)
  items: SingleCartDto[];
}
