export const normalizePhoneNumber = (value: any) =>
  typeof value === 'string'
    ? value.trim().replace(/\s+/g, '').replace(/^(\+98|0098|98)/, '0')
    : value;
