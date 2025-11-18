import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  async validate(token: string, userIp?: string): Promise<boolean> {
    if (!token) {
      throw new UnauthorizedException('Captcha token is missing.');
    }

    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    });

    if (userIp) params.append('remoteip', userIp);

    try {
      const { data } = await axios.post(
        process.env.RECAPTCHA_VERIFY_URL,
        params,
      );

      if (!data.success || data.score < 0.5) {
        throw new UnauthorizedException('Captcha verification failed.');
      }

      return true;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Captcha verification error.');
    }
  }
}
