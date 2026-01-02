import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { SmsType } from 'src/common/types/sms.type';

@Injectable()
export class SmsService {
  private readonly baseUrl = process.env.SMS_BASE_URL;
  private readonly apiKey = process.env.SMS_API_KEY;
  private readonly patternCode = process.env.SMS_PATTERN_CODE;
  private readonly fromNum = process.env.SMS_FROM_NUM;

  async sendOtpSms(options: SmsType): Promise<void> {
    const code = options.code;
    const phone = '+98' + options.phone.slice(1);

    const payload = {
      sending_type: 'pattern',
      from_number: this.fromNum,
      code: this.patternCode,
      recipients: [phone],
      params: {
        'verification-code': code,
      },
    };

    try {
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.apiKey}`,
        },
      });

      if (!response.data?.meta.status) {
        throw new ServiceUnavailableException(
          response.data?.meta.message || 'SMS sending failed.',
        );
      }
    } catch (error) {
      console.error('SMS ERROR:', error);

      if (axios.isAxiosError(error)) {
        throw new ServiceUnavailableException(
          error.response?.data?.meta?.message ||
            error.message ||
            'Failed to send SMS pattern.',
        );
      }

      throw new ServiceUnavailableException('SMS service crashed.');
    }
  }
}
