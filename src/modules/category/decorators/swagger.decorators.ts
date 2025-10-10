import { applyDecorators } from '@nestjs/common';
import {
  GetMethodDoc,
  PostMethodDoc,
  DeleteMethodDoc,
  PutMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { SwaggerContentTypes } from 'src/common/swagger/enums/swagger-content-types.enum';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';

export function CreateCategoryDoc() {
  return applyDecorators(
    PostMethodDoc('Create a new category.', {
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
${SwaggerSharedDescriptions.Image}
- show:
  - Must be a boolean.
`),
    ConflictError('A category with this title already exists.'),
  );
}

export function FindByPaginationDoc() {
  return applyDecorators(
    GetMethodDoc('Get categories by pagination.'),
    BadRequestError(`Invalid request - Validation rules:
      ${SwaggerSharedDescriptions.Pagination}
    `),
  );
}

export function FindAllDoc() {
  return applyDecorators(GetMethodDoc('Get all categories.'));
}

export function FindAllByAdminDoc() {
  return applyDecorators(
    GetMethodDoc('Get all categories by admin.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
      ${SwaggerSharedDescriptions.Pagination}
    `),
  );
}

export function FindByIdDoc() {
  return applyDecorators(
    GetMethodDoc('Find a category by ID.'),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError(),
  );
}

export function UpdateCategoryDoc() {
  return applyDecorators(
    PutMethodDoc('Update a category.', {
      requiresAuth: true,
      requiresAdmin: true,
      consumes: SwaggerContentTypes.Multipart,
    }),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}
- title:
  - Optional.
  - Must not be empty (title is required).
  - Must be a string.
  - Max length = 100.
${SwaggerSharedDescriptions.Image}- Optional.
- show:
  - Optional.
  - Must be a boolean.
`),
    ConflictError('A category with this title already exists.'),
  );
}

export function DeleteCategoryDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete a category.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
  );
}
