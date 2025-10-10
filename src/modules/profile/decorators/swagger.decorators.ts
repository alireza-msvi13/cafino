import { applyDecorators } from '@nestjs/common';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import {
  GetMethodDoc,
  PostMethodDoc,
  PatchMethodDoc,
  DeleteMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import { SwaggerContentTypes } from 'src/common/swagger/enums/swagger-content-types.enum';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';

export function GetUserProfileOverviewDoc() {
  return applyDecorators(
    GetMethodDoc('Get user profile overview.', { requiresAuth: true }),
  );
}

export function GetUserOrdersDoc() {
  return applyDecorators(
    GetMethodDoc('Get user orders.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}`),
  );
}

export function UpdateProfileByUserDoc() {
  return applyDecorators(
    PatchMethodDoc('Update profile by user.', { requiresAuth: true }),
    BadRequestError(
      `Invalid request - Validation rules:
- first_name:
  - Optional.
  - Must be a string.
  - Max length = 100.
- last_name:
  - Optional.
  - Must be a string.
  - Max length = 100.
- birthday:
  - Optional.
  - Must be a valid ISO date string (YYYY-MM-DD).`,
    ),
  );
}

export function AddAddressDoc() {
  return applyDecorators(
    PostMethodDoc('Add a new address by user.', {
      status: 'created',
      requiresAuth: true,
    }),
    BadRequestError(
      `Invalid request - Validation rules:
- province:
  - Required.
  - Must be a string.
  - Max length = 100.
- city:
  - Required.
  - Must be a string.
  - Max length = 100.
- address:
  - Required.
  - Must be a string.
  - Max length = 500.`,
    ),
    ConflictError('You have reached the maximum limit of 5 saved addresses.'),
  );
}

export function UpdateAddressDoc() {
  return applyDecorators(
    PatchMethodDoc('Update an existing address by user.', {
      requiresAuth: true,
    }),
    BadRequestError(
      `Invalid request - Validation rules:
- province:
  - Required.
  - Must be a string.
  - Max length = 100.
- city:
  - Required.
  - Must be a string.
  - Max length = 100.
- address:
  - Required.
  - Must be a string.
  - Max length = 500.`,
    ),
    NotFoundError(),
  );
}

export function DeleteAddressDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete an address by user.', { requiresAuth: true }),
  );
}

export function GetUserAddressesDoc() {
  return applyDecorators(
    GetMethodDoc('Get all user addresses.', { requiresAuth: true }),
  );
}

export function UpdateUserProfileImageDoc() {
  return applyDecorators(
    PatchMethodDoc('Update user profile image.', {
      requiresAuth: true,
      consumes: SwaggerContentTypes.Multipart,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.Image}`),
  );
}

export function DeleteUserProfileImageDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete profile image by user.', { requiresAuth: true }),
  );
}

export function AddItemToFavoritesDoc() {
  return applyDecorators(
    PostMethodDoc('Add a new item to favorites by user.', {
      status: 'created',
      requiresAuth: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError('Item not found.'),
    ConflictError('Item already exists in favorites.'),
  );
}

export function DeleteFavoriteDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete item from favorites.', { requiresAuth: true }),
  );
}

export function GetUserFavoritesDoc() {
  return applyDecorators(
    GetMethodDoc('Get all user favorites.', { requiresAuth: true }),
  );
}
