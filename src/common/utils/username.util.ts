import * as crypto from 'crypto';

export function generateUsername(prefix = 'user'): string {
  return `${prefix}_${crypto.randomUUID().split('-')[0]}`;
}
