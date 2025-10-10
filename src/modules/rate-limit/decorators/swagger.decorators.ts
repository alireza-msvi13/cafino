import { applyDecorators } from '@nestjs/common';
import {
  GetMethodDoc,
  PostMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  NotFoundError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { BlockStatus } from '../enums/block-status.enum';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';

export function GetRateLimitRecordsDoc() {
  return applyDecorators(
    GetMethodDoc('Get all rate-limit records.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- identifier:
  - Optional.
  - Must be a string.
  - Max length = 100.
- endpoint:
  - Optional.
  - Must be a string.
  - Max length = 100.
- blockStatus:
  - Optional.
  - Must be one of enum values: ${Object.values(BlockStatus).join(', ')}.
`),
  );
}

export function GetRateLimitRecordDoc() {
  return applyDecorators(
    GetMethodDoc('Get a specific rate-limit record.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError(),
  );
}

export function BlockUserDoc() {
  return applyDecorators(
    PostMethodDoc('Block user manually - temporary or permanent.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`
Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}
- permanent:
  - Must not be empty.
  - Must be a boolean.
`),
    NotFoundError(),
  );
}

export function UnblockUserDoc() {
  return applyDecorators(
    PostMethodDoc('Unblock user manually.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError(),
  );
}

export function ResetBlockUserDoc() {
  return applyDecorators(
    PostMethodDoc('Reset all rate-limit data for a record by ID.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError(),
  );
}

export function StatsBlockUsersDoc() {
  return applyDecorators(
    GetMethodDoc('Get global rate-limit stats.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
  );
}
