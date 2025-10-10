import { applyDecorators } from '@nestjs/common';
import {
  GetMethodDoc,
  PostMethodDoc,
  PatchMethodDoc,
  DeleteMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import {
  BadRequestError,
  NotFoundError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import { Roles } from 'src/common/enums/role.enum';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';
import { SwaggerContentTypes } from 'src/common/swagger/enums/swagger-content-types.enum';

export function UserInfoDoc() {
  return applyDecorators(
    GetMethodDoc('Get user info.', { requiresAuth: true }),
    NotFoundError(),
  );
}

export function UsersListDoc() {
  return applyDecorators(
    GetMethodDoc('Get all users list.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
      ${SwaggerSharedDescriptions.Pagination}
    `),
  );
}

export function UserPermissionDoc() {
  return applyDecorators(
    PatchMethodDoc('Change user permission.', {
      requiresAuth: true,
      requiresAdmin: true,
      consumes: [SwaggerContentTypes.FormUrlEncoded, SwaggerContentTypes.Json],
    }),
    BadRequestError(`Invalid request - Validation rules:
- phone:
  - Must not be empty.
  - Must match the regex /^09\\d{9}$/.
- role:
  - Must be a valid enum value: ${Object.values(Roles).join(', ')}.
`),
  );
}

export function UsersBlacklistDoc() {
  return applyDecorators(
    GetMethodDoc('Get users blacklist.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
      ${SwaggerSharedDescriptions.Pagination}
    `),
  );
}

export function AddUserToBlacklistDoc() {
  return applyDecorators(
    PostMethodDoc('Add user to blacklist.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
- phone:
  - Must not be empty.
  - Must match the regex /^09\\d{9}$/
`),
  );
}

export function RemoveUserFromBlacklistDoc() {
  return applyDecorators(
    DeleteMethodDoc('Remove user from blacklist.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
- phone:
  - Must not be empty.
  - Must match the regex /^09\\d{9}$/
`),
  );
}
