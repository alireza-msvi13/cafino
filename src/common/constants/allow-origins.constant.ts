export const AllowOrigins: string[] =
  process.env.ALLOWED_ORIGINS?.split(',') ?? [];
