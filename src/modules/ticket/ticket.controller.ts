import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { SortTicketDto } from './dto/sort-ticket.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from 'src/common/enums/role.enum';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import {
  AddMessageToTicketDoc,
  CloseTicketDoc,
  CreateTicketDoc,
  DeleteTicketDoc,
  FindAllTicketsByAdminDoc,
  FindAllUserTicketsDoc,
  GetTicketMessagesDoc,
} from './decorators/swagger.decorators';

@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @UseGuards(JwtGuard)
  @RateLimit({ max: 3, duration: 10 })
  @CreateTicketDoc()
  createTicket(
    @GetUser('id', UUIDValidationPipe) userId: string,
    @Body() createDto: CreateTicketDto,
  ) {
    return this.ticketService.createTicket(userId, createDto);
  }

  @Get()
  @UseGuards(JwtGuard, AdminGuard)
  @FindAllTicketsByAdminDoc()
  findAllTicketsByAdmin(@Query() query: SortTicketDto) {
    return this.ticketService.findAllTickets(query);
  }

  @Get('user')
  @UseGuards(JwtGuard)
  @FindAllUserTicketsDoc()
  findAllUserTickets(
    @GetUser('id', UUIDValidationPipe) userId: string,
    @Query() query: SortTicketDto,
  ) {
    return this.ticketService.findAllTickets(query, userId);
  }

  @Get(':id/messages')
  @UseGuards(JwtGuard)
  @GetTicketMessagesDoc()
  getMessages(
    @Param('id', UUIDValidationPipe) id: string,
    @GetUser('id', UUIDValidationPipe) userId: string,
    @GetUser('role') role: Roles,
  ) {
    return this.ticketService.getMessages(id, userId, role);
  }

  @Post(':id/messages')
  @UseGuards(JwtGuard)
  @RateLimit({ max: 10, duration: 1 })
  @AddMessageToTicketDoc()
  addMessage(
    @Param('id', UUIDValidationPipe) ticketId: string,
    @Body() dto: AddMessageDto,
    @GetUser('id', UUIDValidationPipe) userId: string,
    @GetUser('role') role: Roles,
  ) {
    return this.ticketService.addMessage(dto, ticketId, userId, role);
  }

  @Patch(':id/close')
  @UseGuards(JwtGuard, AdminGuard)
  @CloseTicketDoc()
  closeTicket(@Param('id', UUIDValidationPipe) ticketId: string) {
    return this.ticketService.closeTicket(ticketId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @DeleteTicketDoc()
  deleteTicket(@Param('id', UUIDValidationPipe) ticketId: string) {
    return this.ticketService.deleteTicket(ticketId);
  }
}
