import { applyDecorators } from '@nestjs/common';
import {
  PostMethodDoc,
  GetMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import { BadRequestError } from 'src/common/swagger/decorators/swagger-errors.decorator';
import { SwaggerContentTypes } from 'src/common/swagger/enums/swagger-content-types.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderSortField } from '../enum/order.enum';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';

export function ChangeOrderStatusDoc() {
  return applyDecorators(
    PostMethodDoc('Change order status.', {
      requiresAuth: true,
      requiresAdmin: true,
      consumes: [SwaggerContentTypes.FormUrlEncoded, SwaggerContentTypes.Json],
    }),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}
- status:
  - Required.
  - Must be one of enum values: ${Object.values(OrderStatus).join(', ')}.
`),
  );
}

export function GetAllOrdersDoc() {
  return applyDecorators(
    GetMethodDoc('Get all orders.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Optional.
  - Must be one of enum values: ${Object.values(OrderSortField).join(', ')}.
  - Defaults to ${OrderSortField.Newest}.
- status:
  - Optional.
  - Must be one of enum values: ${Object.values(OrderStatus).join(', ')}.
`),
  );
}
