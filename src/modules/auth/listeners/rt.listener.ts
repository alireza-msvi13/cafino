import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class RtListener {
  constructor(private readonly userService: UserService) {}

  @OnEvent('rt.remove', { async: true })
  async handleOtpSms(payload: any) {
    await this.userService.removeRefreshToken(payload.id, payload.refreshToken);
  }
}
