import { applyDecorators, GoneException } from '@nestjs/common';
import {
  GetMethodDoc,
  PostMethodDoc,
  DeleteMethodDoc,
  PutMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  ConflictError,
  GoneError,
  NotFoundError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { SwaggerContentTypes } from 'src/common/swagger/enums/swagger-content-types.enum';
import { SortByOption } from '../enum/sort-by-option.enum';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';

export function CreateItemDoc() {
  return applyDecorators(
    PostMethodDoc('Create a new item.', {
      requiresAuth: true,
      requiresAdmin: true,
      consumes: SwaggerContentTypes.Multipart,
      status: 'created',
    }),

    BadRequestError(`
Invalid request - Validation rules:
- title:
  - Must not be empty.
  - Must be a string.
  - Max length = 100.
- ingredients:
  - Optional.
  - Must be an array of strings.
  - Max array size = 20.
  - Each item max length = 50.
- description:
  - Optional.
  - Must be a string.
  - Max length = 1000.
- price:
  - Must be an integer.
  - Minimum = 0.
- discount:
  - Must be an integer.
  - Minimum = 0, Maximum = 100.
- quantity:
  - Must be an integer.
  - Minimum = 1.
${SwaggerSharedDescriptions.Images}
- category:
  - Must not be empty.
  - Must be a valid id (UUID v4).
- show:
  - Must be a boolean.
`),
    NotFoundError('Category not found.'),
    GoneError('Category is not allowed to show.'),
    ConflictError('Item with this title or slug already exists.'),
  );
}

export function GetAllItemDoc() {
  return applyDecorators(
    GetMethodDoc('Get all items.'),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Optional.
  - Must be one of enum values: ${Object.values(SortByOption).join(', ')}.
- minPrice:
  - Optional.
  - Must be a number.
- maxPrice:
  - Optional.
  - Must be a number.
- availableOnly:
  - Optional.
  - Must be a boolean (true/false).
  - Defaults to false.
- category:
  - Optional.
  - Must be a string.
  - Max length = 100.
- search:
  - Optional.
  - Must be a string.
  - Max length = 100.
`),
  );
}

export function GetAllItemsByAdminDoc() {
  return applyDecorators(
    GetMethodDoc('Get all items by admin.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Optional.
  - Must be one of enum values: ${Object.values(SortByOption).join(', ')}.
- minPrice:
  - Optional.
  - Must be a number.
- maxPrice:
  - Optional.
  - Must be a number.
- availableOnly:
  - Optional.
  - Must be a boolean (true/false).
  - Defaults to false.
- category:
  - Optional.
  - Must be a string.
  - Max length = 100.
- search:
  - Optional.
  - Must be a string.
  - Max length = 100.
`),
  );
}

export function GetItemByIdDoc() {
  return applyDecorators(
    GetMethodDoc('Get an item by ID.'),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError(),
  );
}

export function UpdateItemDoc() {
  return applyDecorators(
    PutMethodDoc('Update an item.', {
      requiresAuth: true,
      requiresAdmin: true,
      consumes: SwaggerContentTypes.Multipart,
    }),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}
- title:
  - Optional.
  - Must not be empty.
  - Must be a string.
  - Max length = 100.
- ingredients:
  - Optional.
  - Must be an array of strings.
  - Max array size = 20.
  - Each item max length = 50.
- description:
  - Optional.
  - Must be a string.
  - Max length = 1000.
- price:
  - Optional.
  - Must be an integer.
  - Minimum = 0.
- discount:
  - Optional.
  - Must be an integer.
  - Minimum = 0, Maximum = 100.
- quantity:
  - Optional.
  - Must be an integer.
  - Minimum = 1.
${SwaggerSharedDescriptions.Images}- Optional.
- category:
  - Optional.
  - Must not be empty.
  - Must be a valid id (UUID v4).
- show:
  - Optional.
  - Must be a boolean.
`),
    NotFoundError('Category not found.'),
    GoneError('Category is not allowed to show.'),
    ConflictError('Item with this title or slug already exists.'),
  );
}

export function DeleteItemDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete an item.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
  );
}

export function SearchItemDoc() {
  return applyDecorators(
    GetMethodDoc('Search items with optional keyword.'),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- search:
  - Optional.
  - Must be a string.
  - Max length = 100.
`),
  );
}
