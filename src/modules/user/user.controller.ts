import { Body, Controller, Delete, Get, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
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
  constructor(
    private readonly userService: UserService
  ) { }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: "get user info" })
  async getUser(
    @GetUser('phone') phone: string,
    @Res() response: Response,
  ): Promise<Response> {
    return await this.userService.getUserInfo(phone, response)
  }

  @Get("users-list")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "get all users list by admin" })
  async getUserList(
    @Query() paginationDto: PaginationDto,
    @Res() response: Response
  ): Promise<Response> {
    return await this.userService.getUsersList(paginationDto, response);

  }

  @Delete()
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "delete user by admin" })
  async deleteUser(
    @Body() deleteUserDto: UserDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.userService.deleteUser(
      deleteUserDto,
      response
    );
  }

  @Patch("permission")
  @UseGuards(JwtGuard, AdminGuard)
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

  @Get("blacklist")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "get blacklist by admin" })
  async getBlacklist(
    @Query() paginationDto: PaginationDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.userService.getBlacklist(
      paginationDto,
      response
    );
  }

  @Post("blacklist")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "add user to blacklist with phone by admin" })
  async addUserToBlacklist(
    @Body() userDto: UserDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.userService.addUserToBlacklist(
      userDto,
      response
    );
  }

  @Delete("blacklist")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "remove user from blacklist by admin" })
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
