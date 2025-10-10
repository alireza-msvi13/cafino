import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ApiTags } from '@nestjs/swagger';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { ContactQueryDto } from './dto/sort-contact.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-token.guard';
import { Request } from 'express';
import { parseUserAgent } from '../rate-limit/utils/user-agent.utils';
import {
  CreateContactDoc,
  DeleteContactDoc,
  GetAllContactsDoc,
  GetContactRepliesDoc,
  ReplyContactMessageDoc,
} from './decorators/swagger.decorators';

@Controller('contact')
@ApiTags('Contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @RateLimit({ max: 3, duration: 10 })
  @UseGuards(OptionalJwtGuard, RateLimitGuard)
  @CreateContactDoc()
  async create(
    @Body() createContactDto: CreateContactDto,
    @Req() req: Request,
  ) {
    const userId = req?.user && req.user['id'];
    const ip = req.ip;
    const rawUA = req.headers['user-agent'] || '';
    const ua = parseUserAgent(rawUA);
    const identifier = userId ?? `${ip}:${ua.browser}:${ua.os}:${ua.device}`;

    return this.contactService.create(createContactDto, identifier);
  }

  @Get()
  @UseGuards(JwtGuard, AdminGuard)
  @GetAllContactsDoc()
  async findAll(@Query() query: ContactQueryDto) {
    return this.contactService.findAll(query);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @DeleteContactDoc()
  async delete(@Param('id', UUIDValidationPipe) id: string) {
    return this.contactService.delete(id);
  }

  @Post(':id/reply')
  @RateLimit({ max: 10, duration: 1 })
  @UseGuards(JwtGuard, AdminGuard)
  @ReplyContactMessageDoc()
  async replyMessage(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() dto: ReplyContactDto,
  ) {
    return this.contactService.reply(id, dto);
  }

  @Get(':id/replies')
  @UseGuards(JwtGuard, AdminGuard)
  @GetContactRepliesDoc()
  async getReplies(@Param('id', UUIDValidationPipe) id: string) {
    return this.contactService.getReplies(id);
  }
}
