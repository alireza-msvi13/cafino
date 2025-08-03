import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Contact } from './entities/contact.entity';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { Reply } from './entities/reply.entity';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { ContactQueryDto } from './dto/sort-contact.dto';

@Controller('contact')
@ApiTags('Contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }


  @Post()
  @ApiOperation({ summary: 'Create a new contact message' })
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all contact messages with filters' })
  async findAll(
    @Query() query: ContactQueryDto
  ): Promise<BaseResponseDto<Contact[]>> {
    return this.contactService.findAll(query);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to a contact message' })
  async replyMessage(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() dto: ReplyContactDto,
  ) {
    return this.contactService.reply(id, dto);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get all replies for a contact message' })
  async getReplies(@Param('id') id: string): Promise<BaseResponseDto<Reply[]>> {
    return this.contactService.getReplies(id);
  }


}
