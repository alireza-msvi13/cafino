import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class DiscountDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  percent: number;

  @ApiPropertyOptional({ default: 1_000 })
  @IsOptional()
  @IsNumber()
  @Min(1_000)
  @Max(1_000_000)
  amount: number;

  @ApiPropertyOptional({ description: "expires in days", default: "20" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10_000)
  expires_in: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number;
}
