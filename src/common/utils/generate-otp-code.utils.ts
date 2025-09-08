import * as crypto from 'crypto';
export const generateOtpCode = (): string =>
  crypto.randomInt(10000, 99999).toString();
