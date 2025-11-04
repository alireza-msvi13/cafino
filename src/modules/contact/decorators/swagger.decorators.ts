import { applyDecorators } from '@nestjs/common';
import {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import {
  GetMethodDoc,
  PostMethodDoc,
  DeleteMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';
import { PhoneRegex } from 'src/common/constants/regex.constant';

export function CreateContactDoc() {
  return applyDecorators(
    PostMethodDoc('Create a new contact message.', {
      status: 'created',
    }),
    TooManyRequestsError(3, '10 minute'),
    BadRequestError(`Invalid request - Validation rules:
- name:
  - Required.
  - Must be a string.
  - Max length = 100.
- email:
  - Required.
  - Must be a valid email address.
- phone:
  - Required.
  - Must match the regex ${PhoneRegex}.
- message:
  - Required.
  - Must be a string.
  - Max length = 1000.`),
  );
}

export function GetAllContactsDoc() {
  return applyDecorators(
    GetMethodDoc('Get all contact messages with filters.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Optional.
  - Must be one of: [Newest, Oldest].
- identifier:
  - Optional.
  - Must be a string.
  - Max length = 100.
- name:
  - Optional.
  - Must be a string.
  - Max length = 100.
- email:
  - Optional.
  - Must be a valid email.
- phone:
  - Optional.
  - Must match the regex ${PhoneRegex}.
- hasReply:
  - Optional.
  - Boolean.`),
  );
}

export function DeleteContactDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete a contact message.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
  );
}

export function ReplyContactMessageDoc() {
  return applyDecorators(
    PostMethodDoc('Reply to a contact message.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
- subject:
  - Required.
  - Must be a string.
  - Max length = 100.
- message:
  - Required.
  - Must be a string.
  - Max length = 1000.`),
    NotFoundError('Contact not found.'),
  );
}

export function GetContactRepliesDoc() {
  return applyDecorators(
    GetMethodDoc('Get all replies for a contact message.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError('Contact not found.'),
  );
}
