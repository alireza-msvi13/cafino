import { applyDecorators } from '@nestjs/common';
import {
  PostMethodDoc,
  GetMethodDoc,
  PatchMethodDoc,
  DeleteMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  GoneError,
  UnprocessableEntityError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';

export function AddToCartDoc() {
  return applyDecorators(
    PostMethodDoc('Add item to cart.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
- itemId:
  - Must not be empty.
  - Must be a valid id (UUID v4).`),
    NotFoundError(),
    UnprocessableEntityError(`Response Sample:
- error: 'Unfortunately, the '???' stock is less than the quantity you requested.'
- item: '???'
- available_quantity: '???'`),
    ConflictError('Item is already in your cart.'),
  );
}

export function AddMultiItemToCartDoc() {
  return applyDecorators(
    PostMethodDoc('Add multiple items to cart.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
- items:
  - Must be an array.
  - Required.
  - Min size = 1.
  - Max size = 100.
- items[].itemId:
  - Required.
  - Must be a valid id (UUID v4).
- items[].count:
  - Required.
  - Must be an integer.
  - Min = 1.
  - Max = 100 (too large will be rejected).`),
  );
}

export function GetCartDoc() {
  return applyDecorators(GetMethodDoc('Get cart.', { requiresAuth: true }));
}

export function IncrementItemDoc() {
  return applyDecorators(
    PatchMethodDoc('Increment item quantity.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError('Item not found.'),
    ConflictError('Item is not exist in your cart.'),
    UnprocessableEntityError(`Response Sample:
- error: 'Unfortunately, the '???' stock is less than the quantity you requested.'
- item: '???'
- available_quantity: '???'`),
  );
}

export function DecrementItemDoc() {
  return applyDecorators(
    PatchMethodDoc('Decrement item quantity.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError('Item not found.'),
    ConflictError('Item is not exist in your cart.'),
  );
}

export function RemoveItemFromCartDoc() {
  return applyDecorators(
    DeleteMethodDoc('Remove item from cart.', { requiresAuth: true }),
  );
}

export function DeleteCartDoc() {
  return applyDecorators(
    PatchMethodDoc('Delete cart.', { requiresAuth: true }),
  );
}

export function AddDiscountDoc() {
  return applyDecorators(
    PostMethodDoc('Add discount to cart.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
- code:
  - Required.
  - Must be a string.
  - Max length = 100.`),
    NotFoundError('Discount code not found.'),
    GoneError('Discount code expired.'),
    ConflictError('Already used discount.'),
  );
}

export function RemoveDiscountDoc() {
  return applyDecorators(
    DeleteMethodDoc('Remove discount from cart.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
- code:
  - Required.
  - Must be a string.
  - Max length = 100.`),
    NotFoundError('Discount code not found.'),
  );
}
