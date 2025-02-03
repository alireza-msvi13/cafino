


import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, Length, MaxLength } from "class-validator";
export class CreateItemDto {

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    title: string;

    @ApiProperty({ required: false, isArray: true, type: String })
    @IsOptional()
    @IsString({ each: true })
    @Length(0, 50, { each: true })
    ingredients?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @Length(0, 1000)
    description?: string;

    @ApiProperty({ default: 1000, description: 'Price should be a number' })
    @IsNumberString()
    @MaxLength(10)
    price: string;

    @ApiProperty({ default: 0, description: 'Discount should be a number' })
    @IsNumberString()
    @Length(1, 3)
    discount: string;

    @ApiProperty({ default: 1 , description: 'Quantity should be a number' })
    @IsNumberString()
    @MaxLength(100)
    quantity: string;

    @ApiProperty({ format: 'binary', required: false })
    @IsOptional()
    images?: string[];


    @ApiProperty()
    @IsString()
    @MaxLength(36)
    category: string;

}
