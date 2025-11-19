import { applyDecorators } from '@nestjs/common';
import {
  GetMethodDoc,
  PostMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  GoneError,
  NotFoundError,
  TooManyRequestsError,
  UnprocessableEntityError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export function SendOtpDoc() {
  return applyDecorators(
    PostMethodDoc('Send OTP.'),
    TooManyRequestsError(3, '5 minutes'),
    BadRequestError(`
Invalid request - Validation rules:
- phone:
  - Must not be empty.
  - Must match the regex ${PhoneRegex}.
- captchaToken: 
  - Must not be empty.
`),
    ForbiddenError('Unfortunately, you are in the blacklist.'),
    ConflictError(
      'Your previous OTP Code is still valid. Please use it before requesting a new one.',
    ),
    UnprocessableEntityError('Captcha verification failed.'),
  );
}

export function VerifyOtpDoc() {
  return applyDecorators(
    PostMethodDoc('Verify OTP.'),
    TooManyRequestsError(3, '5 minutes'),
    BadRequestError(`
Invalid request - Validation rules:
- phone:
  - Must not be empty.
  - Must match the regex ${PhoneRegex}.
- otpCode:
  - Must not be empty.
  - Must be a number string (only digits).
  - Must be exactly 5 digits (length = 5).
`),
    NotFoundError('No account is registered with this phone number.'),
    ForbiddenError('Unfortunately, you are in the blacklist.'),
    ConflictError(
      'This OTP code has already been used. Please request a new code.',
    ),
    GoneError('Your OTP code has expired. Please request a new one.'),
    UnprocessableEntityError(
      'The OTP code you entered is incorrect. Please try again.',
    ),
  );
}

export function ResendOtpDoc() {
  return applyDecorators(
    PostMethodDoc('Resend OTP code.'),
    TooManyRequestsError(3, '5 minutes'),
    BadRequestError(`
Invalid request - Validation rules:
- phone:
  - Must not be empty.
  - Must match the regex ${PhoneRegex}.
- captchaToken: 
  - Must not be empty.
`),
    NotFoundError('No account is registered with this phone number.'),
    ForbiddenError('Unfortunately, you are in the blacklist.'),
    ConflictError(
      'Your previous OTP Code is still valid. Please use it before requesting a new one.',
    ),
    UnprocessableEntityError('Captcha verification failed.'),
  );
}

export function RefreshTokenDoc() {
  return applyDecorators(
    GetMethodDoc('Generate new Tokens.', { requiresAuth: true }),
  );
}

export function LogoutDoc() {
  return applyDecorators(GetMethodDoc('Logout user.', { requiresAuth: true }));
}
