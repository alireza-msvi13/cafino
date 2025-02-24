import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, IsUUID, Length, MaxLength } from "class-validator";
export class CreateItemDto {

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    title: string;

    @ApiPropertyOptional({ isArray: true, type: String })
    @IsOptional()
    @IsString({ each: true })
    @Length(0, 50, { each: true })
    ingredients?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(0, 1000)
    description?: string;

    @ApiProperty({ default: 1000 })
    @IsNumberString()
    @MaxLength(10)
    price: string;

    @ApiPropertyOptional({ default: 0 })
    @IsNumberString()
    @Length(1, 3)
    discount: string;

    @ApiProperty({ default: 1 })
    @IsNumberString()
    @MaxLength(100)
    quantity: string;

    @ApiPropertyOptional({ format: 'binary' })
    @IsOptional()
    images: string[];


    @ApiProperty()
    @IsUUID('4', { message: "categoryId is not valid" })
    category: string;

    @ApiProperty({ type: "boolean", default: true })
    @Length(4, 5)
    show: boolean;

}
