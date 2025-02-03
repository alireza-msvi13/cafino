import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPhoneNumber } from "class-validator";

const errorMessage = "phone number is not correct";
export class LoginUserDto {

    @IsNotEmpty({ message: errorMessage })
    @IsPhoneNumber('IR', { message: errorMessage })
    @ApiProperty({
        title: "enter phone number for login",
        example: "09254652258",
        nullable: false
    })
    phone: string;
}