import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(100)
  title: string;

  @ApiProperty({ format: 'binary' })
  image: string;

  @ApiProperty({ type: 'boolean', default: true })
  @IsBoolean({ message: 'show must be boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'true';
    }
    return value;
  })
  show: boolean;
}
