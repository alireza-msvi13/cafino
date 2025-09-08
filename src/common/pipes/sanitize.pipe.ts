import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value === 'object') {
      this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any) {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const val = obj[key];

      if (typeof val === 'string') {
        obj[key] = sanitizeHtml(val.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        });
      }

      if (typeof val === 'object' && val !== null) {
        this.sanitizeObject(val);
      }
    }
  }
}
