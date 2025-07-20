import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
    IsArray,
    ArrayMaxSize,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Max,
    Min
} from "class-validator";
export class CreateItemDto {

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    title: string;


    @ApiPropertyOptional({ isArray: true, type: String })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    ingredients?: string[];


    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ default: 1000 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price: number;

    @ApiProperty({ default: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    discount: number;

    @ApiProperty({ default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;


    @ApiPropertyOptional({ format: 'binary' })
    @IsOptional()
    images: string[];


    @ApiProperty()
    @IsUUID('4', { message: "categoryId is not valid" })
    category: string;

    @ApiProperty({ type: "boolean", default: true })
    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
        return false;
    })
    @IsBoolean()
    show: boolean;

}
