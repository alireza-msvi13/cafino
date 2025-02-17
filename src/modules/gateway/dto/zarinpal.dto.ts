
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

 class ZarinpalUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString()
    mobile?: string;
  }

export class ZarinpalRequestDto {
    @IsNumber()
    amount: number;
    
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => ZarinpalUserDto)
    user?: ZarinpalUserDto
}
