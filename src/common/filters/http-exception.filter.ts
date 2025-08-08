import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { parseUserAgent } from 'src/modules/rate-limit/utils/user-agent.utils';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? this.extractMessage(exception)
      : INTERNAL_SERVER_ERROR_MESSAGE;


    if (status >= 500 || process.env.NODE_ENV === 'development') {
      const ip =
        (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        request.socket.remoteAddress;

      const rawUserAgent = request.headers['user-agent'] || '';
      const userAgent = parseUserAgent(rawUserAgent);

      const userId = request.user?.['id'];
      const identifier = userId ?? `${ip}:${userAgent.browser}:${userAgent.os}:${userAgent.device}`;

      this.logger.error({
        path: request.url,
        method: request.method,
        message: exception instanceof Error ? exception.message : String(message),
        stack: exception instanceof Error ? exception.stack : undefined,
        statusCode: status,
        ip,
        userAgent,
        userId,
        identifier,
      });
    }



    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractMessage(exception: HttpException): string | string[] {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;

    const resMessage = (response as any)?.message;

    if (Array.isArray(resMessage)) {
      return resMessage;
    }

    return resMessage || INTERNAL_SERVER_ERROR_MESSAGE;
  }



}
