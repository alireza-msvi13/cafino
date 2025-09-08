import sanitizeHtml from 'sanitize-html';

export function Sanitize(
  options: sanitizeHtml.IOptions = { allowedTags: [], allowedAttributes: {} },
) {
  return function (target: any, propertyKey: string) {
    const key = `__sanitized__${propertyKey}`;

    Object.defineProperty(target, propertyKey, {
      get: function () {
        return this[key];
      },
      set: function (value: any) {
        if (typeof value === 'string') {
          this[key] = sanitizeHtml(value, options);
        } else {
          this[key] = value;
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}
