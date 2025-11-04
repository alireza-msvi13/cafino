import { applyDecorators } from '@nestjs/common';
import {
  PostMethodDoc,
  GetMethodDoc,
  PutMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { SortCommentOption } from '../enum/comment.enum';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export function CreateCommentDoc() {
  return applyDecorators(
    PostMethodDoc('Create a new comment for an item.', {
      status: 'created',
      requiresAuth: true,
    }),
    TooManyRequestsError(3, '10 minute'),
    BadRequestError(`Invalid request - Validation rules:
- text:
  - Must not be empty.
  - Must be a string.
  - Max length = 500.
- itemId:
  - Must not be empty.
  - Must be a valid id (UUID v4).
- parentId:
  - Optional.
  - Must be a valid id (UUID v4).
- star:
  - Optional.
  - Must be an integer.
  - Minimum = 1, Maximum = 5.
  - Default = 5.`),
    NotFoundError('Item not found.'),
  );
}

export function GetItemCommentsDoc() {
  return applyDecorators(
    GetMethodDoc('Get comments for an item.'),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Must be one of ${Object.values(SortCommentOption).join(', ')}.`),
    NotFoundError('Item not found.'),
  );
}

export function GetAllCommentsDoc() {
  return applyDecorators(
    GetMethodDoc('See all comments.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
      ${SwaggerSharedDescriptions.Pagination}
- sortBy: 
    - Must be one of ${Object.values(SortCommentOption).join(', ')}.
- accept: 
    - Optional.
    - boolean.
- itemId:
    - Optional.
    - Must be a valid id (UUID v4).
- userId:
    - Optional.
    - Must be a valid id (UUID v4).
- phone:
    - Optional.
    - Must match the regex ${PhoneRegex}.`),
  );
}

export function AcceptCommentDoc() {
  return applyDecorators(
    PutMethodDoc('Accept a comment.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError(),
    ConflictError('Comment is already accepted.'),
  );
}

export function RejectCommentDoc() {
  return applyDecorators(
    PutMethodDoc('Reject a comment.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError(),
    ConflictError('Comment is already rejected.'),
  );
}
