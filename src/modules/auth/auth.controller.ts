import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiResponseProperty, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ResendCodeDto } from './dto/resend-code.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerfiyOtpDto } from './dto/verfiy-otp.dto';
import { PublicGuard } from './guards/public.guard';
import { RefreshGuard } from './guards/refresh-token.guard';
import { JwtGuard } from './guards/access-token.guard';
import { SwaggerTypes } from 'src/common/enums/swagger.enum';
import { GetCookie } from 'src/common/decorators/get-cookie.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('send-otp')
    @ApiOperation({ summary: "send otp" })
    @ApiConsumes(SwaggerTypes.FORM_URL_ENCODED, SwaggerTypes.JSON)
    async sendOtp(
        @Body() loginUserDto: LoginUserDto,
        @Res() response: Response
    ): Promise<Response> {
        return this.authService.sendOtp(
            loginUserDto.phone,
            response
        );
    }

    @Post('verfiy-otp')
    @ApiOperation({ summary: "verfiy otp" })
    @ApiBody({ type: VerfiyOtpDto, required: true })
    @ApiConsumes(SwaggerTypes.FORM_URL_ENCODED, SwaggerTypes.JSON)
    async verfiyOtp(
        @Body() verfiyOtpDto: VerfiyOtpDto,
        @Res() response: Response,
    ): Promise<Response> {
        return this.authService.verfiyOtp(
            verfiyOtpDto.phone,
            verfiyOtpDto.otpCode,
            response
        )
    }

    @Post('resend-otp')
    @ApiOperation({ summary: "resend otp code" })
    @ApiConsumes(SwaggerTypes.FORM_URL_ENCODED, SwaggerTypes.JSON)
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
        @GetCookie("refresh-token") refreshToken: string,
        @Res() response: Response
    ): Promise<Response | void> {
        return await this.authService.refreshToken(
            response,
            refreshToken,
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
