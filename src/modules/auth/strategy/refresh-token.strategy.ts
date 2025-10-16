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
          const header = request?.headers['refresh-token'];
          const cookie = request?.cookies?.['refresh-token'];
          return (header as string) || cookie || null;
        },
      ]),
    });
  }
  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<{ id: string; role: Roles }> {
    if (!payload?.id) throw new UnauthorizedException('Invalid token payload.');

    const refreshToken =
      (request?.headers['refresh-token'] as string) ||
      request?.cookies?.['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
    const { id, role } = await this.authService.validateRefreshToken(
      refreshToken,
      payload.id,
    );
    return {
      id,
      role: role as Roles,
    };
  }
}
