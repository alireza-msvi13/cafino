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
import { Roles } from 'src/common/enums/role.enum';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller('rate-limit')
@ApiTags('Rate Limit')
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get('records')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @GetRateLimitRecordsDoc()
  async getRateLimitRecords(@Query() rateLimitQueryDto: RateLimitQueryDto) {
    return await this.rateLimitService.getRateLimitRecords(rateLimitQueryDto);
  }

  @Get('record/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @GetRateLimitRecordDoc()
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    return await this.rateLimitService.findById(id);
  }

  @Post('block/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.SuperAdmin)
  @BlockUserDoc()
  async blockUser(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() dto: BlockUserDto,
  ) {
    return this.rateLimitService.blockManually(id, dto);
  }

  @Post('unblock/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.SuperAdmin)
  @UnblockUserDoc()
  async unblockUser(@Param('id', UUIDValidationPipe) id: string) {
    return this.rateLimitService.unblockManually(id);
  }

  @Post('reset/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.SuperAdmin)
  @ResetBlockUserDoc()
  reset(@Param('id', UUIDValidationPipe) id: string) {
    return this.rateLimitService.resetById(id);
  }

  @Get('stats')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @StatsBlockUsersDoc()
  stats() {
    return this.rateLimitService.getStats();
  }
}
