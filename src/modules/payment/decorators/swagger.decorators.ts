import { applyDecorators } from '@nestjs/common';
import { PostMethodDoc } from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  ConflictError,
  GoneError,
  NotFoundError,
  TooManyRequestsError,
  UnprocessableEntityError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';

export function PaymentGatewayDoc() {
  return applyDecorators(
    PostMethodDoc('Payment gateway.', {
      requiresAuth: true,
    }),
    TooManyRequestsError(5, '5 minute'),
    BadRequestError(`Invalid request - Validation rules:
- addressId:
  - Must not be empty.
  - Must be a valid id (UUID v4).
- description:
  - Optional.
  - Must be a string.
  - Max length = 500.`),
    NotFoundError('Address not found.'),
    ConflictError('Order creation failed: cart is empty.'),
    GoneError('Item ??? is not available.'),
    UnprocessableEntityError(`Response Sample:
- error: 'Unfortunately, the '???' stock is less than the quantity you requested.'
- item: '???'
- available_quantity: '???'`),
  );
}
