import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyContactDto {
    @ApiProperty({ example: 'Regarding your order #12345', })
    @IsString()
    @IsNotEmpty({ message: 'Subject cannot be empty' })
    @MinLength(10)
    @MaxLength(150)
    subject: string;

    @ApiProperty({
        example:
            'Hello, your order is currently being processed and will be shipped within the next 24 hours. Thank you for your patience.',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(2000)
    message: string;
}
