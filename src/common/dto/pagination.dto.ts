import { ApiProperty } from "@nestjs/swagger"

export class PaginationDto {
    @ApiProperty({ default: 10 })
    limit: number
    @ApiProperty({ default: 1 })
    page: number
}
