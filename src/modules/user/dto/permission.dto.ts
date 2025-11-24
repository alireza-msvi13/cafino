import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Roles } from 'src/common/enums/role.enum';

export class UserPermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Id is not valid.' })
  id: string;

  @ApiProperty({ enum: Roles })
  @IsEnum(Roles)
  role: Roles = Roles.User;
}
