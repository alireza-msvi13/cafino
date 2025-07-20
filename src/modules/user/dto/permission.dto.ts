import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsPhoneNumber, IsUUID, Length } from "class-validator";
import { Roles } from "src/common/enums/role.enum";

const errorMessage = "phone number is not correct";


export class UserPermissionDto {

    @IsNotEmpty({ message: errorMessage })
    @Transform(({ value }) =>
        value.replace(/\s+/g, '').replace(/^(\+98|0098|98)/, '0')
    )
    @IsPhoneNumber('IR', { message: errorMessage })
    @Length(11, 11, { message: "phone number must be 11 digits" })
    @ApiProperty({
        title: "enter phone number for login",
        example: "09375012365",
        nullable: false
    })
    phone: string;

    @ApiProperty({ enum: Roles })
    @IsEnum(Roles)
    role: string;
}