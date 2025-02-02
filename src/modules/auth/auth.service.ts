import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { ResendCodeDto } from './dto/resend-code.dto';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt"
import { generateOtpCode } from 'src/common/utils/generate-otp-code.utils';
import { SmsService } from '../sms/sms.service';
import { SmsType } from 'src/common/types/sms.type';
import { JwtPayload } from 'src/common/types/jwt-payload-type';
import { AccessCookieConfig, RefreshCookieConfig } from 'src/common/constants/token-config.constants';
import { TokenType } from 'src/common/types/token.type';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private configService: ConfigService,
        private jwtService: JwtService,
        private smsService: SmsService
    ) { }

    // * primary

    async sendOtp(
        phone: string,
        response: Response
    ): Promise<Response> {
        const otpCode: string = generateOtpCode();
        const expireIn = new Date(Date.now() + (1000 * 60 * 2));

        try {

            const user = await this.userService.createUser(phone)

            await this.userService.saveOtp(
                otpCode,
                expireIn,
                user.id,
                phone
            );
            const smsOptions: SmsType = {
                phone,
                code: otpCode
            }
            // await this.smsService.sendSms(smsOptions)
            return response
                .status(HttpStatus.OK)
                .json({
                    message: `Code ${otpCode} Send Successfully`,
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async verfiyOtp(
        phone: string,
        otpCode: string,
        response: Response
    ): Promise<Response> {
        try {
            const user = await this.userService.findUser(phone, ['otp']);

            const now = new Date();
            if (now > user.otp.expires_in) {
                throw new HttpException(
                    "Code Expired",
                    HttpStatus.UNAUTHORIZED
                )
            }

            if (user.otp.code !== otpCode) {
                throw new HttpException(
                    "Code is Not Correct",
                    HttpStatus.UNAUTHORIZED
                )
            }
            const tokens = await this.createTokens(
                user.phone,
                user.id.toString()
            );
            const rtHash = await bcrypt.hash(
                tokens.refreshToken,
                10
            );
            await this.userService.saveRefreshToken(phone, rtHash);
            response.cookie(
                'access-token',
                tokens.accessToken,
                AccessCookieConfig
            );
            response.cookie(
                "refresh-token",
                tokens.refreshToken,
                RefreshCookieConfig
            );
            return response
                .status(HttpStatus.OK)
                .json({
                    tokens,
                    message: "You login Successfully",
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async refreshToken(
        response: Response,
        refreshToken: string,
        phone: string
    ): Promise<Response | void> {
        try {
            const user = await this.userService.findUser(phone)
            const isTokensEqual: boolean = await bcrypt.compare(
                refreshToken,
                user.rt_hash
            );
            if (!isTokensEqual) {
                throw new HttpException(
                    "Token is Not Valid",
                    HttpStatus.UNAUTHORIZED
                );
            }
            const isValidToken = await this.jwtService.verify(
                refreshToken,
                {
                    secret: process.env.REFRESH_TOKEN_SECRET
                }
            )
            if (!isValidToken) {
                throw new HttpException(
                    "Token is Not Valid",
                    HttpStatus.UNAUTHORIZED
                );
            }
            const tokens: TokenType = await this.createTokens(
                phone,
                user.id.toString()
            );
            const hashRefresh = await bcrypt.hash(
                tokens.refreshToken,
                10
            );
            await this.userService.saveRefreshToken(
                phone,
                hashRefresh
            );
            response.cookie(
                'access-token',
                tokens.accessToken,
                AccessCookieConfig
            );
            response.cookie(
                "refresh-token",
                tokens.refreshToken,
                RefreshCookieConfig
            );
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "New Token is Created",
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async resendOtp(
        response: Response,
        { phone }: ResendCodeDto
    ): Promise<Response> {
        try {

            const otpCode: string = generateOtpCode();
            const expireIn = new Date(Date.now() + (1000 * 60 * 2));

            await this.userService.updateOtpCode(phone, otpCode, expireIn)
            const smsOptions: SmsType = {
                phone,
                code: otpCode
            }
            // // await this.smsService.sendSms(smsOptions)

            return response
                .status(HttpStatus.OK)
                .json({
                    message: `Code ${otpCode} Send Successfully`,
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async logout(
        phone: string,
        response: Response
    ): Promise<Response> {
        try {
            const d = new Date();
            response.clearCookie(
                "refresh-token",
                {
                    sameSite: 'none',
                    httpOnly: false,
                    secure: true
                }
            );
            response.clearCookie(
                "access-token",
                {
                    sameSite: 'none',
                    httpOnly: false,
                    secure: true
                }
            );
            delete response?.req?.user;
            delete response?.req?.cookies;
            delete response?.req?.rawHeaders[3];
            delete response?.req?.headers.cookie;
            await this.userService.removeRefreshToken(phone);
            const responseMessage: string = "خروج کاربر با موفقیت انجام شد"
            return response
                .status(HttpStatus.OK)
                .json({
                    message: responseMessage,
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    // * helper

    async createTokens(
        phone: string, userId: string
    ): Promise<TokenType> {
        try {
            const jwtPayload: JwtPayload = {
                user: userId,
                phone
            }
            const [
                accessToken,
                refreshToken
            ] = await Promise.all([
                this.jwtService.signAsync(
                    jwtPayload, {
                    secret: process.env.ACCESS_TOKEN_SECRET,
                    expiresIn: '1h'
                }),
                this.jwtService.signAsync(
                    jwtPayload, {
                    secret: process.env.REFRESH_TOKEN_SECRET,
                    expiresIn: '3d'
                })
            ])
            return {
                accessToken,
                refreshToken
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async validRefreshToken(
        refreshToken: string,
        userPhone: string
    ): Promise<string> {
        try {
            const {
                rt_hash,
                phone
            } = await this.userService.findUser(userPhone);
            const isTokensEqual: boolean = await bcrypt.compare(
                refreshToken,
                rt_hash
            );
            if (!isTokensEqual) {
                throw new HttpException(
                    "Token is not Valid", HttpStatus.UNAUTHORIZED
                );
            }
            const isTokenValid = await this.jwtService.verify(
                refreshToken,
                { secret: process.env.REFRESH_TOKEN_SECRET }
            )
            if (!isTokenValid) {
                throw new HttpException(
                    "Token is not Valid", HttpStatus.UNAUTHORIZED
                );
            }
            return phone;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async getAccessToken(
        phone: string, userId: string
    ): Promise<string> {
        try {
            const jwtPayload: JwtPayload = {
                user: userId,
                phone
            }
            const accessToken = await this.jwtService.signAsync(
                jwtPayload, {
                secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
                expiresIn: '1h'
            })
            return accessToken
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}
