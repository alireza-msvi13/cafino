import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Request successful' })
    message: string;

    @ApiProperty()
    data: T;
}
