import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConsumes,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { SwaggerContentTypes } from 'src/common/swagger/enums/swagger-content-types.enum';
import { ForbiddenError, UnauthorizedError } from './swagger-errors.decorator';
import { SwaggerSharedDescriptions } from '../constants/swagger-descriptions.constants';

/**
 * Utility to add standard decorators for endpoint documentation.
 * @param summary – short summary of the endpoint
 * @param options – config for access level and content type
 */

function AccessDocs({
  requiresAuth,
  requiresAdmin,
}: {
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}) {
  const decorators = [];
  if (requiresAuth) decorators.push(UnauthorizedError());
  if (requiresAdmin) {
    decorators.push(UnauthorizedError(), ForbiddenError());
  }
  return decorators;
}

export function PostMethodDoc(
  summary: string,
  {
    requiresAuth = false,
    requiresAdmin = false,
    consumes = [SwaggerContentTypes.Json],
    status = 'ok',
  }: {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    consumes?: string[] | string;
    status?: 'ok' | 'created';
  } = {},
) {
  const consumeList = Array.isArray(consumes) ? consumes : [consumes];

  const responseDecorator =
    status === 'created'
      ? ApiCreatedResponse({ description: 'Created successfully.' })
      : ApiOkResponse({ description: 'Request completed successfully.' });

  return applyDecorators(
    ...AccessDocs({ requiresAuth, requiresAdmin }),
    ...consumeList.map((type) => ApiConsumes(type)),
    responseDecorator,
    ApiOperation({ summary }),
  );
}

export function GetMethodDoc(
  summary: string,
  {
    requiresAuth = false,
    requiresAdmin = false,
  }: {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
  } = {},
) {
  return applyDecorators(
    ...AccessDocs({ requiresAuth, requiresAdmin }),
    ApiOkResponse({ description: 'Fetched successfully.' }),
    ApiOperation({ summary }),
  );
}

export function PatchMethodDoc(
  summary: string,
  {
    requiresAuth = false,
    requiresAdmin = false,
    consumes = [SwaggerContentTypes.Json],
  }: {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    consumes?: string[] | string;
  } = {},
) {
  const consumeList = Array.isArray(consumes) ? consumes : [consumes];
  return applyDecorators(
    ...AccessDocs({ requiresAuth, requiresAdmin }),
    ...consumeList.map((type) => ApiConsumes(type)),
    ApiOkResponse({ description: 'Updated successfully.' }),
    ApiOperation({ summary }),
  );
}

export function PutMethodDoc(
  summary: string,
  {
    requiresAuth = false,
    requiresAdmin = false,
    consumes = [SwaggerContentTypes.Json],
  }: {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    consumes?: string[] | string;
  } = {},
) {
  const consumeList = Array.isArray(consumes) ? consumes : [consumes];
  return applyDecorators(
    ...AccessDocs({ requiresAuth, requiresAdmin }),
    ...consumeList.map((type) => ApiConsumes(type)),
    ApiOkResponse({ description: 'Updated successfully.' }),
    ApiOperation({ summary }),
  );
}

export function DeleteMethodDoc(
  summary: string,
  {
    requiresAuth = false,
    requiresAdmin = false,
  }: {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
  } = {},
) {
  return applyDecorators(
    ...AccessDocs({ requiresAuth, requiresAdmin }),
    ApiBadRequestResponse({
      description: `Invalid request - Validation rules:
      ${SwaggerSharedDescriptions.UUID}
      `,
    }),
    ApiNotFoundResponse({
      description: 'Resource not found.',
    }),
    ApiOkResponse({ description: 'Deleted successfully.' }),
    ApiOperation({ summary }),
  );
}
