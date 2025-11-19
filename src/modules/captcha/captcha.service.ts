import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  async validate(token: string, userIp?: string): Promise<boolean> {
    if (!token) {
      throw new UnprocessableEntityException('Captcha token is missing.');
    }

    try {
      const { data } = await axios.post(
        process.env.CLOUDFLARE_TURNSTILE_VERIFY_URL,
        new URLSearchParams({
          secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: userIp || '',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      if (!data.success) {
        throw new UnprocessableEntityException('Captcha verification failed.');
      }

      return true;
    } catch (err) {
      console.log(err);
      throw new UnprocessableEntityException('Captcha verification error.');
    }
  }
}
