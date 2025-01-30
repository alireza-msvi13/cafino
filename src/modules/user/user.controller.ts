import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @UseGuards(JwtGuard)
  @ApiOperation({ summary: "get user info" })
  @Get()
  async getUser(
    @GetUser('phone') phone: string,
    @Res() response: Response,
  ): Promise<Response> {
    return await this.userService.getUserInfo(phone, response)
  }

  @UseGuards(AdminGuard)
  @Get("users-list")
  @ApiOperation({ summary: "get all users list" })
  async getUserList(
    @Res() response: Response
  ): Promise<Response> {
    return await this.userService.getUsersList(response);

  }
}
