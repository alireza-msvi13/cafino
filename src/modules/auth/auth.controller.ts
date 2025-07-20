import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResendCodeDto } from './dto/resend-code.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyOtpDto } from './dto/verfiy-otp.dto';
import { RefreshGuard } from './guards/refresh-token.guard';
import { JwtGuard } from './guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RateLimitGuard } from 'src/modules/rate-limit/guards/rate-limit.guard';
import { RateLimit } from 'src/modules/rate-limit/decorators/rate-limit.decorator';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @UseGuards(RateLimitGuard)
    @RateLimit({ max: 10, duration: 1 })
    @Post('send-otp')
    @ApiOperation({ summary: "send otp" })
    async sendOtp(
        @Body() loginUserDto: LoginUserDto,
        @Res() response: Response
    ): Promise<Response> {
        return this.authService.sendOtp(
            loginUserDto.phone,
            response
        );
    }

    @UseGuards(RateLimitGuard)
    @RateLimit({ max: 10, duration: 1 })
    @Post('verfiy-otp')
    @ApiOperation({ summary: "verfiy otp" })
    @ApiBody({ type: VerifyOtpDto, required: true })
    async verfiyOtp(
        @Body() VerifyOtpDto: VerifyOtpDto,
        @Res() response: Response,
    ): Promise<Response> {
        return this.authService.verfiyOtp(
            VerifyOtpDto.phone,
            VerifyOtpDto.otpCode,
            response
        )
    }

    @UseGuards(RateLimitGuard)
    @RateLimit({ max: 10, duration: 1 })
    @Post('resend-otp')
    @ApiOperation({ summary: "resend otp code" })
    async resendOtp(
        @Res() response: Response,
        @Body() resendCodeDto: ResendCodeDto
    ): Promise<Response> {
        return this.authService.resendOtp(response, resendCodeDto);
    }

    @UseGuards(RefreshGuard)
    @Get('refresh')
    @ApiOperation({ summary: "generate new refresh & access token" })
    async refreshToken(
        @GetUser("phone") phone: string,
        @GetUser("id") userId: string,
        @Res() response: Response
    ): Promise<Response | void> {
        return await this.authService.refreshToken(
            response,
            userId,
            phone
        );
    }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: "logout user" })
    @Get('logout')
    async logout(
        @GetUser("phone") phone: string,
        @Res() response: Response
    ) {
        await this.authService.logout(phone, response);
    }

}
