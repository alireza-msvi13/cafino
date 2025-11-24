import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
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

  @Patch('permission/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Manager)
  @UserPermissionDoc()
  async changeUserPermission(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() userPermissionDto: UserPermissionDto,
  ) {
    return this.userService.changeUserPermission(id, userPermissionDto);
  }

  @Get('blacklist')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @UsersBlacklistDoc()
  async getUsersBlacklist(@Query() paginationDto: PaginationDto) {
    return this.userService.getUsersBlacklist(paginationDto);
  }

  @Post('blacklist/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Manager)
  @AddUserToBlacklistDoc()
  async addUserToBlacklist(@Param('id', UUIDValidationPipe) id: string) {
    return this.userService.addUserToBlacklist(id);
  }

  @Delete('blacklist/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Manager)
  @RemoveUserFromBlacklistDoc()
  async removeUserToBlacklist(@Param('id', UUIDValidationPipe) id: string) {
    return this.userService.removeUserToBlacklist(id);
  }
}
