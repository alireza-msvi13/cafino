import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ? This interceptor transforms empty string values in the request body to `undefined`.
// ? This is useful for Swagger ApiConsumes (multipart/form-data and application/x-www-form-urlencoded)

@Injectable()
export class EmptyStringToUndefindInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    if (req.body) {
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] === '') {
          req.body[key] = undefined;
        }
      });
    }
    return next.handle().pipe(map((data) => data));
  }
}
