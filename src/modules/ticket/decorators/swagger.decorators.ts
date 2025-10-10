import { applyDecorators } from '@nestjs/common';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
} from 'src/common/swagger/decorators/swagger-errors.decorator';
import {
  GetMethodDoc,
  PostMethodDoc,
  PatchMethodDoc,
  DeleteMethodDoc,
} from 'src/common/swagger/decorators/swagger-methods.decorator';
import { SwaggerSharedDescriptions } from 'src/common/swagger/constants/swagger-descriptions.constants';
import { SortTicket } from '../enum/ticket.enum';

export function CreateTicketDoc() {
  return applyDecorators(
    PostMethodDoc('Create a new ticket.', {
      status: 'created',
      requiresAuth: true,
    }),
    TooManyRequestsError(3, '10 minute'),
    BadRequestError(`Invalid request - Validation rules:
- subject:
  - Required.
  - Must be a string.
  - Max length = 100.
- message:
  - Required.
  - Must be a string.
  - Max length = 1000.`),
  );
}

export function FindAllTicketsByAdminDoc() {
  return applyDecorators(
    GetMethodDoc('Get all tickets by admin.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Optional.
  - Must be a valid enum value: ${Object.values(SortTicket).join(', ')}.  
- status:
  - Optional.
  - Must be a valid ticket status.`),
  );
}

export function FindAllUserTicketsDoc() {
  return applyDecorators(
    GetMethodDoc('Get all user tickets.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.Pagination}
- sortBy:
  - Optional.
  - Must be a valid enum value: ${Object.values(SortTicket).join(', ')}.  
- status:
  - Optional.
  - Must be a valid ticket status.`),
  );
}

export function GetTicketMessagesDoc() {
  return applyDecorators(
    GetMethodDoc('Get all messages for a ticket.', { requiresAuth: true }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError('Ticket not found.'),
    ForbiddenError('Access denied: You are not the owner of this ticket.'),
  );
}

export function AddMessageToTicketDoc() {
  return applyDecorators(
    PostMethodDoc('Add a message to a ticket.', {
      status: 'created',
      requiresAuth: true,
    }),
    TooManyRequestsError(3, '10 minute'),
    BadRequestError(`Invalid request - Validation rules:
- message:
  - Required.
  - Must be a string.
  - Max length = 1000.`),
    NotFoundError('Ticket not found.'),
    ConflictError('Ticket is closed.'),
    ForbiddenError('Access denied: You are not the owner of this ticket.'),
  );
}

export function CloseTicketDoc() {
  return applyDecorators(
    PatchMethodDoc('Close a ticket by admin.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
    BadRequestError(`Invalid request - Validation rules:
${SwaggerSharedDescriptions.UUID}`),
    NotFoundError('Ticket not found.'),
  );
}

export function DeleteTicketDoc() {
  return applyDecorators(
    DeleteMethodDoc('Delete a ticket by admin.', {
      requiresAuth: true,
      requiresAdmin: true,
    }),
  );
}
