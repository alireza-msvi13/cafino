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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = INTERNAL_SERVER_ERROR_MESSAGE;


    const userId = request?.user && request.user['id']
    const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.socket.remoteAddress;
    const rawUA = request.headers['user-agent'] || '';
    const ua = parseUserAgent(rawUA);
    const identifier = userId ?? `${ip}:${ua.browser}:${ua.os}:${ua.device}`;
    

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any)?.message || INTERNAL_SERVER_ERROR_MESSAGE;
    }

    if (status >= 500 || process.env.NODE_ENV === 'development') {
      this.logger.error({
        path: request.url,
        method: request.method,
        message: exception instanceof Error ? exception.message : message,
        stack: exception instanceof Error ? exception.stack : null,
        statusCode: status,
        ip,
        userAgent: ua,
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
}
