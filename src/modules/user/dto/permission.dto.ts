import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Roles } from 'src/common/enums/role.enum';

export class UserPermissionDto {
  @ApiProperty({ enum: Roles })
  @IsEnum(Roles)
  role: Roles = Roles.User;
}
