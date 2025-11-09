import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RefreshStrategy } from './strategy/refresh-token.strategy';
import { JwtStrategy } from './strategy/access-token.strategy';
import { UserModule } from '../user/user.module';
import { RateLimitModule } from 'src/modules/rate-limit/rate-limit.module';
import { SmsListener } from './listeners/sms.listener';
import { CaptchaModule } from '../captcha/captcha.module';
@Module({
  imports: [
    UserModule,
    RateLimitModule,
    CaptchaModule,
    PassportModule.register({}),
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshStrategy, JwtStrategy, SmsListener],
  exports: [AuthService],
})
export class AuthModule {}
