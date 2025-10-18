import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { UserPermissionDto } from './dto/permission.dto';
import { UserDto } from './dto/user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  UserPermissionDoc,
  UserInfoDoc,
  UsersListDoc,
  UsersBlacklistDoc,
  AddUserToBlacklistDoc,
  RemoveUserFromBlacklistDoc,
} from './decorators/swagger.decorators';
import { Roles } from 'src/common/enums/role.enum';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtGuard)
  @UserInfoDoc()
  async getUserInfo(@GetUser('id') id: string) {
    return await this.userService.getUserInfo(id);
  }

  @Get('users-list')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @UsersListDoc()
  async getUserList(@Query() paginationDto: PaginationDto) {
    return await this.userService.getUsersList(paginationDto);
  }

  @Patch('permission')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Manager)
  @UserPermissionDoc()
  async changeUserPermission(@Body() userPermissionDto: UserPermissionDto) {
    return this.userService.changeUserPermission(userPermissionDto);
  }

  @Get('blacklist')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @UsersBlacklistDoc()
  async getUsersBlacklist(@Query() paginationDto: PaginationDto) {
    return this.userService.getUsersBlacklist(paginationDto);
  }

  @Post('blacklist')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @AddUserToBlacklistDoc()
  async addUserToBlacklist(@Body() userDto: UserDto) {
    return this.userService.addUserToBlacklist(userDto);
  }

  @Delete('blacklist')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @RemoveUserFromBlacklistDoc()
  async removeUserToBlacklist(@Body() userDto: UserDto) {
    return this.userService.removeUserToBlacklist(userDto);
  }
}
