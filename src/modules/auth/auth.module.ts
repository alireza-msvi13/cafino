import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminStrategy } from './strategy/admin.strategy';
import { RefreshStrategy } from './strategy/refresh-token.strategy';
import { JwtStrategy } from './strategy/access-token.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule.register({}),
    JwtModule.register({ 
      global: true,
     }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshStrategy,
    JwtStrategy,
    AdminStrategy
  ],
  exports: [
    AuthService
  ]
})

export class AuthModule { }
