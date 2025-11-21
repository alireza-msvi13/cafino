import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ResendCodeDto } from './dto/resend-code.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyOtpDto } from './dto/verfiy-otp.dto';
import { RefreshGuard } from './guards/refresh-token.guard';
import { JwtGuard } from './guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RateLimitGuard } from 'src/modules/rate-limit/guards/rate-limit.guard';
import { RateLimit } from 'src/modules/rate-limit/decorators/rate-limit.decorator';
import {
  LogoutDoc,
  RefreshTokenDoc,
  ResendOtpDoc,
  SendOtpDoc,
  VerifyOtpDoc,
} from 'src/modules/auth/decorators/swagger.decorators';
import { Roles } from 'src/common/enums/role.enum';
import { CaptchaGuard } from '../captcha/guard/captcha.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  @RateLimit({ max: 3, duration: 10 })
  @UseGuards(CaptchaGuard, RateLimitGuard)
  @SendOtpDoc()
  async sendOtp(@Body() loginUserDto: LoginUserDto) {
    return this.authService.sendOtp(loginUserDto.phone);
  }

  @Post('verify-otp')
  @RateLimit({ max: 3, duration: 10 })
  @UseGuards(RateLimitGuard)
  @VerifyOtpDoc()
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyOtp(
      verifyOtpDto.phone,
      verifyOtpDto.otpCode,
      res,
    );
  }

  @Post('resend-otp')
  @RateLimit({ max: 3, duration: 10 })
  @UseGuards(CaptchaGuard, RateLimitGuard)
  @ResendOtpDoc()
  async resendOtp(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.resendOtp(resendCodeDto);
  }

  @Get('refresh')
  @UseGuards(RefreshGuard)
  @RefreshTokenDoc()
  async refreshToken(
    @GetUser('id') userId: string,
    @GetUser('role') role: Roles,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refreshToken(res, userId, role);
  }

  @Get('logout')
  @UseGuards(JwtGuard)
  @LogoutDoc()
  async logout(
    @GetUser('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.logout(id, res);
  }
}
