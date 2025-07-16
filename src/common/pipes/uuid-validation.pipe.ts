import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ParseUUIDPipe,
} from '@nestjs/common';

@Injectable()
export class UUIDValidationPipe implements PipeTransform<string> {
  private readonly parseUUID = new ParseUUIDPipe({
    exceptionFactory: () => new BadRequestException('Invalid Item Id'),
  });

  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    return this.parseUUID.transform(value, metadata);
  }
}
