import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BlockStatus } from 'src/modules/rate-limit/enums/block-status.enum';
import { IsBoolean, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class RateLimitQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(100)
  identifier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(100)
  endpoint?: string;

  @ApiPropertyOptional({
    enum: BlockStatus,
  })
  @IsOptional()
  @IsEnum(BlockStatus)
  blockStatus?: BlockStatus;
}

export class BlockUserDto {
  @ApiProperty({ default: false })
  @IsBoolean()
  permanent: boolean;
}
