import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from 'src/common/types/jwt-payload-type';
import { Roles } from 'src/common/enums/role.enum';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private authService: AuthService) {
    super({
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.headers['refresh-token']
            ? request?.headers['refresh-token']
            : request?.cookies['refresh-token'];
          return data ? data : null;
        },
      ]),
    });
  }
  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<{ id: string; role: Roles }> {
    if (!payload || !payload?.id) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
    const refreshToken = request?.cookies['refresh-token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
    const { id, role } = await this.authService.validRefreshToken(
      refreshToken,
      payload.id,
    );
    return {
      id,
      role: role as Roles,
    };
  }
}
