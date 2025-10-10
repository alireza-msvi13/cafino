import { ApiTags } from '@nestjs/swagger';
import { RateLimitService } from './rate-limit.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { BlockUserDto, RateLimitQueryDto } from './dto/rate-limit-query.dto';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import {
  GetRateLimitRecordDoc,
  GetRateLimitRecordsDoc,
  BlockUserDoc,
  UnblockUserDoc,
  ResetBlockUserDoc,
  StatsBlockUsersDoc,
} from './decorators/swagger.decorators';
@Controller('rate-limit')
@UseGuards(JwtGuard, AdminGuard)
@ApiTags('Rate Limit')
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get('records')
  @GetRateLimitRecordsDoc()
  async getRateLimitRecords(@Query() rateLimitQueryDto: RateLimitQueryDto) {
    return await this.rateLimitService.getRateLimitRecords(rateLimitQueryDto);
  }

  @Get('record/:id')
  @GetRateLimitRecordDoc()
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    return await this.rateLimitService.findById(id);
  }

  @Post('block/:id')
  @BlockUserDoc()
  async blockUser(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() dto: BlockUserDto,
  ) {
    return this.rateLimitService.blockManually(id, dto);
  }

  @Post('unblock/:id')
  @UnblockUserDoc()
  async unblockUser(@Param('id', UUIDValidationPipe) id: string) {
    return this.rateLimitService.unblockManually(id);
  }

  @Post('reset/:id')
  @ResetBlockUserDoc()
  reset(@Param('id', UUIDValidationPipe) id: string) {
    return this.rateLimitService.resetById(id);
  }

  @Get('stats')
  @StatsBlockUsersDoc()
  stats() {
    return this.rateLimitService.getStats();
  }
}
