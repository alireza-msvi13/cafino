import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsPhoneNumber, IsUUID } from "class-validator";
import { Roles } from "src/common/enums/role.enum";

const errorMessage = "phone number is not correct";


export class UserPermissionDto {

    @IsNotEmpty({ message: errorMessage })
    @IsPhoneNumber('IR', { message: errorMessage })
    @ApiProperty({
        example: "09375012365",
        nullable: false
    })
    phone: string;

    @ApiProperty({ enum: Roles })
    @IsEnum(Roles)
    role: string;
}