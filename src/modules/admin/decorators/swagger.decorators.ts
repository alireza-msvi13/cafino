import { applyDecorators } from '@nestjs/common';
import { BadRequestError } from 'src/common/swagger/decorators/swagger-errors.decorator';
import { GetMethodDoc } from 'src/common/swagger/decorators/swagger-methods.decorator';

export function FullAdminOverviewDoc() {
  return applyDecorators(
    GetMethodDoc(`Get full admin dashboard overview.`, {
      requiresAdmin: true,
      requiresAuth: true,
    }),
  );
}

export function AdminOverviewDoc(module: string) {
  return applyDecorators(
    GetMethodDoc(`Get ${module} overview for dashboard.`, {
      requiresAdmin: true,
      requiresAuth: true,
    }),
  );
}

export function SalesReportDoc() {
  return applyDecorators(
    GetMethodDoc('Get sales report by date range.', {
      requiresAdmin: true,
      requiresAuth: true,
    }),
    BadRequestError(
      `Invalid request - Validation rules:
- start:
  - Optional.
  - Must be a valid ISO date string ("2025-01-01").
- end:
  - Optional.
  - Must be a valid ISO date string ("2025-01-31").`,
    ),
  );
}
