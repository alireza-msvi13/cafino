import { applyDecorators } from '@nestjs/common';
import {
  BadRequestError,
  ConflictError,
  UnprocessableEntityError,
  NotFoundError,
  GoneError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { SwaggerContentTypes } from 'src/common/swagger/enums/swagger-content-types.enum';
import { DiscountSortField } from '../enum/discount.enum';
import {
  DeleteMethodDoc,
  GetMethodDoc,
  PostMethodDoc,
  PutMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';

export function CreateDiscountDoc() {
  return applyDecorators(
    PostMethodDoc('Generate new discount code.', {
      requiresAuth: true,
      requiresAdmin: true,
      consumes: SwaggerContentTypes.Json,
      status: 'created',
    }),
    BadRequestError(`Invalid request - Validation rules:
- code:
  - Required.
  - Must be a string.
  - Max length = 100.
- percent:
  - Optional.
  - Must be a number.
  - Min = 1, Max = 100.
- amount:
  - Optional.
  - Must be a number.
  - Min = 1000.
- expires_in:
  - Required.
  - Must be a number.
  - Min = 1, Max = 1000 (days).
- limit:
  - Required.
  - Must be a number.
  - Min = 1, Max = 100.`),
    ConflictError('Code already exists.'),
    UnprocessableEntityError(
      'You must enter either Amount or Percent, not both.',
    ),
  );
}

export function UpdateActivityStatusDoc() {
  return applyDecorators(
    PutMethodDoc('Change discount status.', {
      requiresAuth: true,
      requiresAdmin: true,
      consumes: [SwaggerContentTypes.FormUrlEncoded, SwaggerContentTypes.Json],
    }),
    BadRequestError(`Invalid request - Validation rules:
- status: 
  - Required.
  - Must be a boolean.
`),
    NotFoundError('Discount code not found.'),
    ConflictError('Discount code is already active or inactive.'),
    GoneError('Discount code expired.'),
  );
}

export function DeleteDiscountCodeDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete a discount code.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
  );
}

export function GetAllDiscountCodesDoc() {
  return applyDecorators(
    GetMethodDoc('Get all discount codes.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Optional.
  - Must be one of enum values: ${Object.values(DiscountSortField).join(', ')}.
  - Defaults to ${DiscountSortField.Newest}.
- isActive:
  - Optional.
  - Must be a boolean.
  - Filters discounts based on whether they are currently active.`),
  );
}
