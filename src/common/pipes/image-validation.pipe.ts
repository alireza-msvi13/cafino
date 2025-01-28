import { Injectable, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';

@Injectable()
export class ImageValidationPipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: 'image/(png|jpg|jpeg|webp)' }),
      ],
    });
  }
}
