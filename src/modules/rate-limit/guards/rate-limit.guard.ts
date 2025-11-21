import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../rate-limit.service';
import {
  RATE_LIMIT_OPTIONS,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';
import { parseUserAgent } from 'src/modules/rate-limit/utils/user-agent.utils';
import { getRealIp } from 'src/common/utils/ip.util';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const userId = req?.user && req.user['id'];
    const ip = getRealIp(req);
    const signedCookieId = req.signedCookies?.['rlid'];
    const endpoint = req.route.path;

    let identifier: string;

    if (userId) {
      identifier = `user-${userId}`;
    } else {
      identifier = await this.rateLimitService.resolveGuestIdentifier(
        ip,
        signedCookieId,
        res,
      );
    }

    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_OPTIONS,
      context.getHandler(),
    );
    const max = options?.max ?? 10;
    const duration = options?.duration ?? 1;

    await this.rateLimitService.action(identifier, ip, endpoint, max, duration);
    return true;
  }
}
