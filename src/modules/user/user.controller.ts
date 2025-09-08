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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserPermissionDto } from './dto/permission.dto';
import { UserDto } from './dto/user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get user info.' })
  async getUser(@GetUser('phone') phone: string) {
    return await this.userService.getUserInfo(phone);
  }

  @Get('users-list')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all users list by admin.' })
  async getUserList(@Query() paginationDto: PaginationDto) {
    return await this.userService.getUsersList(paginationDto);
  }

  @Delete()
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete user by admin.' })
  async deleteUser(@Body() deleteUserDto: UserDto) {
    return this.userService.deleteUser(deleteUserDto);
  }

  @Patch('permission')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Change user permission by admin.' })
  async changeUserPermission(@Body() userPermissionDto: UserPermissionDto) {
    return this.userService.changeUserPermission(userPermissionDto);
  }

  @Get('blacklist')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Get blacklist by admin.' })
  async getBlacklist(@Query() paginationDto: PaginationDto) {
    return this.userService.getBlacklist(paginationDto);
  }

  @Post('blacklist')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Add user to blacklist with phone by admin.' })
  async addUserToBlacklist(@Body() userDto: UserDto) {
    return this.userService.addUserToBlacklist(userDto);
  }

  @Delete('blacklist')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Remove user from blacklist by admin.' })
  async removeUserToBlacklist(@Body() userDto: UserDto) {
    return this.userService.removeUserToBlacklist(userDto);
  }
}
