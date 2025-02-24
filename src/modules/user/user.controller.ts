import { Body, Controller, Delete, Get, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserPermissionDto } from './dto/permission.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({ summary: "get user info" })
  async getUser(
    @GetUser('phone') phone: string,
    @Res() response: Response,
  ): Promise<Response> {
    return await this.userService.getUserInfo(phone, response)
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Get("users-list")
  @ApiOperation({ summary: "get all users list by admin" })
  async getUserList(
    @Res() response: Response
  ): Promise<Response> {
    return await this.userService.getUsersList(response);

  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete()
  @ApiOperation({ summary: "delete user" })
  async deleteUser(
    @Body() deleteUserDto: UserDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.userService.deleteUser(
      deleteUserDto,
      response
    );
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Patch("permission")
  @ApiOperation({ summary: "change user permission by admin" })
  async changeUserPermission(
    @Res() response: Response,
    @Body() userPermissionDto: UserPermissionDto
  ): Promise<Response> {
    return this.userService.changeUserPermission(
      userPermissionDto,
      response
    )
  }

  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "get blacklist by admin" })
  @Get("blacklist")
  async getBlacklist(
    @Res() response: Response
  ): Promise<Response> {
    return this.userService.getBlacklist(
      response
    );
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Post("blacklist")
  @ApiOperation({ summary: "add user to blacklist by phone" })
  async addUserToBlacklist(
    @Body() userDto: UserDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.userService.addUserToBlacklist(
      userDto,
      response
    );
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete("blacklist")
  @ApiOperation({ summary: "remove user from blacklist" })
  async removeUserToBlacklist(
    @Body() userDto: UserDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.userService.removeUserToBlacklist(
      userDto,
      response
    );
  }

}
