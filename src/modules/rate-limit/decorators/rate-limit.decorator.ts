import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_OPTIONS = 'rate:options';

export interface RateLimitOptions {
  max: number;
  duration: number; // in minutes
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_OPTIONS, options);
