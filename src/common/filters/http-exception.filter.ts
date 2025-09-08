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
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? this.extractMessage(exception)
      : INTERNAL_SERVER_ERROR_MESSAGE;

    const ip = req.ip;

    const rawUserAgent = req.headers['user-agent'] || '';
    const userAgent = parseUserAgent(rawUserAgent);

    const userId = req.user?.['id'];
    const identifier =
      userId ??
      `${ip}:${userAgent.browser}:${userAgent.os}:${userAgent.device}`;

    this.logger.error({
      path: req.url,
      method: req.method,
      message: exception instanceof Error ? exception.message : String(message),
      stack: exception instanceof Error ? exception.stack : undefined,
      statusCode: status,
      ip,
      userAgent,
      userId,
      identifier,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
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
