import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
  ApiGoneResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

/**
 *  Common reusable Swagger error decorators.
 *  Use them directly in method docs.
 */

export const BadRequestError = (description = 'Invalid request.') =>
  ApiBadRequestResponse({ description });

export const UnauthorizedError = (
  description = 'Unauthorized: Invalid or expired token.',
) => ApiUnauthorizedResponse({ description });

export const ForbiddenError = (
  description = "Access denied: You don't have permission.",
) => ApiForbiddenResponse({ description });

export const AdminForbiddenError = (
  description = 'Access denied: Only admins can perform this action.',
) => ApiForbiddenResponse({ description });

export const NotFoundError = (description = 'Resource not found.') =>
  ApiNotFoundResponse({ description });

export const ConflictError = (description = 'Conflict occurred.') =>
  ApiConflictResponse({ description });

export const GoneError = (description = 'Resource is no longer available.') =>
  ApiGoneResponse({ description });

export const UnprocessableEntityError = (
  description = 'Request could not be processed.',
) => ApiUnprocessableEntityResponse({ description });

export const TooManyRequestsError = (
  max: number,
  duration: string,
  description = `Too many requests. Please try again later.`,
) =>
  ApiTooManyRequestsResponse({
    description: `${description}
- Additional information can be found in the response:
  - Block-Type: temporary or permanent
  - Retry-After: number of seconds to wait before retrying
- Limit: ${max} requests per ${duration}.
`,
  });

export const InternalServerError = (description = 'Unexpected server error.') =>
  ApiInternalServerErrorResponse({ description });
