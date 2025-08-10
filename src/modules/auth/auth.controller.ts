import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResendCodeDto } from './dto/resend-code.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyOtpDto } from './dto/verfiy-otp.dto';
import { RefreshGuard } from './guards/refresh-token.guard';
import { JwtGuard } from './guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RateLimitGuard } from 'src/modules/rate-limit/guards/rate-limit.guard';
import { RateLimit } from 'src/modules/rate-limit/decorators/rate-limit.decorator';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { ResendOtpDoc, SendOtpDoc, VerfiyOtpDoc } from 'src/common/decorators/swagger.decorators';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('send-otp')
    @RateLimit({ max: 10, duration: 1 })
    @UseGuards(RateLimitGuard)
    @SendOtpDoc()
    async sendOtp(
        @Body() loginUserDto: LoginUserDto,
    ): Promise<ServerResponse> {
        return this.authService.sendOtp(
            loginUserDto.phone,
        );
    }

    @Post('verfiy-otp')
    @RateLimit({ max: 10, duration: 1 })
    @UseGuards(RateLimitGuard)
    @VerfiyOtpDoc()
    async verfiyOtp(
        @Body() VerifyOtpDto: VerifyOtpDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<ServerResponse> {
        return this.authService.verfiyOtp(
            VerifyOtpDto.phone,
            VerifyOtpDto.otpCode,
            res
        )
    }

    @Post('resend-otp')
    @RateLimit({ max: 10, duration: 1 })
    @UseGuards(RateLimitGuard)
    @ResendOtpDoc()
    async resendOtp(
        @Body() resendCodeDto: ResendCodeDto
    ): Promise<ServerResponse> {
        return this.authService.resendOtp(resendCodeDto);
    }

    @Get('refresh')
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: "generate new refresh & access token" })
    async refreshToken(
        @GetUser("phone") phone: string,
        @GetUser("id") userId: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<ServerResponse> {
        return await this.authService.refreshToken(
            res,
            userId,
            phone
        );
    }

    @Get('logout')
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: "logout user" })
    async logout(
        @GetUser("phone") phone: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<ServerResponse> {
        return await this.authService.logout(phone, res);
    }

}
