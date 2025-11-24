export function maskFields<T>(items: T[], fields: string[]) {
  return items.map((item) => {
    fields.forEach((field) => {
      const value = field
        .split('.')
        .reduce((obj: any, key) => obj?.[key], item);

      if (
        value &&
        typeof value === 'string' &&
        value.startsWith('09') &&
        value.length >= 11
      ) {
        const masked = value.replace(/^(\d{4})\d+(\d{3})$/, '$1****$2');

        let ref = item as any;
        const keys = field.split('.');
        keys.forEach((key, index) => {
          if (index === keys.length - 1) ref[key] = masked;
          else ref = ref[key];
        });
      }
    });

    return item;
  });
}
