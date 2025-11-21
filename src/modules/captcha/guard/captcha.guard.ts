import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CaptchaService } from '../captcha.service';
import { getRealIp } from 'src/common/utils/ip.util';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private readonly captchaService: CaptchaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const captchaToken =
      request.body?.captchaToken ||
      request.headers['x-captcha-token'] ||
      request.query?.captchaToken;

    if (!captchaToken) {
      throw new UnprocessableEntityException('Captcha token is missing.');
    }

    const ip = getRealIp(request);

    await this.captchaService.validate(captchaToken, ip);

    return true;
  }
}
