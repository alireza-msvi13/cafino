import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/types/sms.type';
import { SmsService } from 'src/modules/sms/sms.service';

@Injectable()
export class SmsListener {
  constructor(private readonly smsService: SmsService) {}

  @OnEvent('sms.otp.send', { async: true })
  async handleOtpSms(payload: SmsType) {
    await this.smsService.sendOtpSms(payload);
  }
}
