import { Request } from 'express';

export function getRealIp(req: Request): string {
  // 1. Cloudflare
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return Array.isArray(cfIp) ? cfIp[0] : cfIp;

  // 2. Generic proxies
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0];
    return ip.trim();
  }

  // 3. Native Nest/Express
  let ip = req.ip;

  // 4. Remove ::ffff:
  if (ip?.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip;
}
