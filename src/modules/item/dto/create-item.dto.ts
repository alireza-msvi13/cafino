


import { ApiProperty } from "@nestjs/swagger";
import { CategoryEntity } from "src/modules/category/entities/category.entity";

export class CreateItemDto {

    @ApiProperty()
    title: string;

    @ApiProperty({ required: false, isArray: true, type: [String] })
    ingredients?: string[];

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    price: number;

    @ApiProperty({required: false})
    discount?: number;

    @ApiProperty()
    quantity: number;

    @ApiProperty({ format: 'binary', required: false })
    images?: string[];

    
    @ApiProperty()
    category: string;

}
