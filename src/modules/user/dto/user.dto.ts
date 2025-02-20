
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";


const errorMessage = "phone number is not correct";

export class UserDto {
    @IsNotEmpty({ message: errorMessage })
    @IsPhoneNumber('IR', { message: errorMessage })
    @ApiProperty({
        example: "09375012365",
        nullable: false
    })
    phone: string;
}
