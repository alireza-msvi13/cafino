import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResendCodeDto } from './dto/resend-code.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { generateOtpCode } from 'src/common/utils/generate-otp-code.utils';
import { SmsService } from '../sms/sms.service';
import { SmsType } from 'src/common/types/sms.type';
import { JwtPayload } from 'src/common/types/jwt-payload-type';
import {
  AccessCookieConfig,
  RefreshCookieConfig,
} from 'src/common/constants/token-config.constants';
import { TokenType } from 'src/common/types/token.type';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { Roles } from 'src/common/enums/role.enum';
import { generateUsername } from 'src/common/utils/username.util';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private smsService: SmsService,
  ) { }

  // * primary

  async sendOtp(phone: string): Promise<ServerResponse> {

    const existingUser = await this.userService.findByPhoneWithOtp(phone);

    if (existingUser?.status === UserStatus.Block) {
      throw new ForbiddenException("Unfortunately, you are in the blacklist.");
    }

    const now = new Date();
    if (existingUser?.otp && now < existingUser.otp.expires_in) {
      throw new ConflictException(
        "Your previous OTP Code is still valid. Please use it before requesting a new one."
      );
    }

    let user = existingUser;
    if (!user) {
      const usersCount = await this.userService.countUsers();
      const role = usersCount === 0 ? Roles.Admin : Roles.User;
      user = await this.userService.createUser({
        username: generateUsername(),
        phone,
        role
      });
    }

    const otpCode: string = generateOtpCode();
    const expireIn = new Date(Date.now() + 1000 * 60 * 2);
    await this.userService.saveOtp(otpCode, expireIn, user.id, phone);


    // const smsOptions: SmsType = { phone, code: otpCode };
    // await this.smsService.sendSms(smsOptions);

    return new ServerResponse(HttpStatus.OK, 'Code sent successfully.', { otpCode });
  }
  async verfiyOtp(
    phone: string,
    otpCode: string,
    res: Response
  ): Promise<ServerResponse> {

    const user = await this.userService.findByPhoneWithOtp(phone);

    if (!user || !user.otp) {
      throw new NotFoundException("No account is registered with this phone number.");
    }

    if (user.status === UserStatus.Block) {
      throw new ForbiddenException("Unfortunately, you are in the blacklist.");
    }

    if (user.otp.is_used) {
      throw new ConflictException("This OTP code has already been used. Please request a new code.");
    }

    const now = new Date();
    if (now > user.otp.expires_in) {
      throw new GoneException("Your OTP code has expired. Please request a new one.");
    }

    if (user.otp.code !== otpCode) {
      throw new UnprocessableEntityException("The OTP code you entered is incorrect. Please try again.");
    }

    const tokens = await this.createTokens(user.phone, user.id);
    const rtHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userService.saveRefreshToken(phone, rtHash);
    res.cookie('access-token', tokens.accessToken, AccessCookieConfig);
    res.cookie('refresh-token', tokens.refreshToken, RefreshCookieConfig);

    await this.userService.changeOtpStatusToUsed(user.otp.id);

    return new ServerResponse(HttpStatus.OK, 'You login successfully.', { tokens });

  }
  async refreshToken(
    res: Response,
    userId: string,
    phone: string,
  ): Promise<ServerResponse> {
    const tokens: TokenType = await this.createTokens(
      phone,
      userId,
    );
    const hashRefresh = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userService.saveRefreshToken(phone, hashRefresh);
    res.cookie('access-token', tokens.accessToken, AccessCookieConfig);
    res.cookie(
      'refresh-token',
      tokens.refreshToken,
      RefreshCookieConfig,
    );

    return new ServerResponse(HttpStatus.OK, 'Tokens refreshed successfully.');
  }
  async resendOtp(
    { phone }: ResendCodeDto,
  ): Promise<ServerResponse> {
    const user = await this.userService.findByPhoneWithOtp(phone);

    if (!user || !user.otp) {
      throw new NotFoundException("No account is registered with this phone number.");
    }

    if (user.status === UserStatus.Block) {
      throw new ForbiddenException("Unfortunately, you are in the blacklist.");
    }

    const now = new Date();
    if (now < user.otp.expires_in) {
      throw new ConflictException(
        "Your previous OTP Code is still valid. Please use it before requesting a new one."
      );
    }
    const otpCode: string = generateOtpCode();
    const expireIn = new Date(Date.now() + 1000 * 60 * 2);
    await this.userService.saveOtp(otpCode, expireIn, user.id, phone);

    // const smsOptions: SmsType = { phone, code: otpCode };
    // await this.smsService.sendSms(smsOptions);

    return new ServerResponse(HttpStatus.OK, 'Code send successfully.', { otpCode });

  }
  async logout(phone: string, res: Response): Promise<ServerResponse> {
    res.clearCookie('refresh-token', {
      sameSite: 'none',
      httpOnly: false,
      secure: true,
    });
    res.clearCookie('access-token', {
      sameSite: 'none',
      httpOnly: false,
      secure: true,
    });
    delete res?.req?.user;
    delete res?.req?.cookies;
    delete res?.req?.rawHeaders[3];
    delete res?.req?.headers.cookie;
    await this.userService.removeRefreshToken(phone);

    return new ServerResponse(HttpStatus.OK, 'You logout successfully.');

  }

  // * helper

  async createTokens(phone: string, userId: string): Promise<TokenType> {
    const jwtPayload: JwtPayload = {
      user: userId,
      phone,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  async validRefreshToken(
    refreshToken: string,
    userPhone: string,
  ): Promise<{ id: string; phone: string }> {
    const { rt_hash, phone, id } = await this.userService.findUser(userPhone);
    const isTokensEqual: boolean = await bcrypt.compare(
      refreshToken,
      rt_hash,
    );
    if (!isTokensEqual) throw new UnauthorizedException('Token is not valid.');

    const isTokenValid = await this.jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    if (!isTokenValid) throw new UnauthorizedException('Token is not valid.');

    return { phone, id };
  }
}
