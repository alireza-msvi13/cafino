import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../rate-limit.service';
import {
  RATE_LIMIT_OPTIONS,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';
import { parseUserAgent } from 'src/modules/rate-limit/utils/user-agent.utils';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const userId = req?.user && req.user['id'];
    const ip = req.ip;

    const rawUA = req.headers['user-agent'] || '';
    const ua = parseUserAgent(rawUA);

    const identifier = userId ?? `${ip}:${ua.browser}:${ua.os}:${ua.device}`;
    const endpoint = req.route.path;

    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_OPTIONS,
      context.getHandler(),
    );
    const max = options?.max ?? 10;
    const duration = options?.duration ?? 1;

    await this.rateLimitService.action(identifier, endpoint, max, duration);
    return true;
  }
}
