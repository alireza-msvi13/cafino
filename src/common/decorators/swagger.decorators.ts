import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiUnprocessableEntityResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { VerifyOtpDto } from 'src/modules/auth/dto/verfiy-otp.dto';
import { SwaggerContentTypes } from '../enums/swagger.enum';

export function SendOtpDoc() {
  return applyDecorators(
    ApiForbiddenResponse({
      description: 'Unfortunately, you are in the blacklist',
    }),
    ApiConflictResponse({
      description:
        'Your previous OTP Code is still valid. Please use it before requesting a new one.',
    }),
    ApiTooManyRequestsResponse({
      description:
        'You have reached the maximum number of OTP requests. Please try again later.',
    }),
    ApiOkResponse({ description: 'Code sent successfully' }),
    ApiOperation({ summary: 'Send otp.' }),
  );
}
export function VerfiyOtpDoc() {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'No account is registered with this phone number.',
    }),
    ApiForbiddenResponse({
      description: 'Unfortunately, you are in the blacklist',
    }),
    ApiConflictResponse({
      description:
        'This OTP code has already been used. Please request a new code.',
    }),
    ApiGoneResponse({
      description: 'Your OTP code has expired. Please request a new one.',
    }),
    ApiUnprocessableEntityResponse({
      description: 'The OTP code you entered is incorrect. Please try again.',
    }),
    ApiTooManyRequestsResponse({
      description:
        'You have reached the maximum number of OTP requests. Please try again later.',
    }),
    ApiOkResponse({ description: 'You login successfully' }),
    ApiOperation({ summary: 'Verfiy otp.' }),
    ApiBody({ type: VerifyOtpDto, required: true }),
  );
}
export function ResendOtpDoc() {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'No account is registered with this phone number.',
    }),
    ApiForbiddenResponse({
      description: 'Unfortunately, you are in the blacklist',
    }),
    ApiConflictResponse({
      description:
        'Your previous OTP Code is still valid. Please use it before requesting a new one.',
    }),
    ApiTooManyRequestsResponse({
      description:
        'You have reached the maximum number of OTP requests. Please try again later.',
    }),
    ApiOperation({ summary: 'Resend otp code.' }),
    ApiOkResponse({ description: 'Code sent successfully' }),
  );
}
export function UpdateActivityStatusDoc() {
  return applyDecorators(
    ApiNotFoundResponse({ description: 'Discount Not Found.' }),
    ApiConflictResponse({
      description: 'Discount is already active || inactive.',
    }),
    ApiBadRequestResponse({ description: 'Discount code expired.' }),
    ApiConsumes(SwaggerContentTypes.FormUrlEncoded, SwaggerContentTypes.Json),
    ApiOperation({ summary: 'Change discount status.' }),
    ApiOkResponse({
      description: 'Discount status updated to active || inactive',
    }),
  );
}
