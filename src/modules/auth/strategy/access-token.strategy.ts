import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { JwtPayload } from 'src/common/types/jwt-payload-type';
import { Roles } from 'src/common/enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.headers['access-token']
            ? request?.headers['access-token']
            : request?.cookies['access-token'];
          return data ? data : null;
        },
      ]),
    });
  }
  async validate(payload: JwtPayload): Promise<{ id: string; role: Roles }> {
    if (!payload || !payload?.id) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
    const user = await this.userService.findUser(payload.id);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
    return {
      id: user.id,
      role: user.role,
    };
  }
}
