import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { CaptchaGuard } from './guard/captcha.guard';

@Module({
  providers: [CaptchaService, CaptchaGuard],
  exports: [CaptchaGuard, CaptchaService],
})
export class CaptchaModule {}
