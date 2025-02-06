import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class DiscountDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  @Length(1, 3)
  percent: string;

  @ApiPropertyOptional()
  @IsOptional() 
  @IsNumberString()
  @MaxLength(10)
  amount: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  @MaxLength(100)
  expires_in: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  @MaxLength(10)
  limit: string;
}
