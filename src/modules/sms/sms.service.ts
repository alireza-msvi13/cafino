import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SmsType } from 'src/common/types/sms.type';
import axios from 'axios';

@Injectable()
export class SmsService {
  async sendSms(options: SmsType): Promise<void> {
    const { phone, code } = options;

    const requestBody = {
      op: 'pattern',
      user: process.env.SMS_USER,
      pass: process.env.SMS_PASS,
      fromNum: process.env.SMS_FROM_NUM,
      toNum: phone,
      patternCode: process.env.SMS_PATTERN_CODE,
      inputData: [{ 'verification-code': code }],
    };

    try {
      const response = await axios.post(process.env.SMS_BASE_URL, requestBody);
      if (typeof response.data !== 'number' && Number(response.data[0]) !== 0) {
        throw new InternalServerErrorException(response.data[1]);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
