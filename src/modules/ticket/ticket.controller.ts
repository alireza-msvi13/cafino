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
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';

@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @RateLimit({ max: 3, duration: 10 })
  @UseGuards(JwtGuard, RateLimitGuard)
  @CreateTicketDoc()
  createTicket(
    @GetUser('id', UUIDValidationPipe) userId: string,
    @Body() createDto: CreateTicketDto,
  ) {
    return this.ticketService.createTicket(userId, createDto);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
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
  @RateLimit({ max: 10, duration: 1 })
  @UseGuards(JwtGuard, RateLimitGuard)
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
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @CloseTicketDoc()
  closeTicket(@Param('id', UUIDValidationPipe) ticketId: string) {
    return this.ticketService.closeTicket(ticketId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.Manager)
  @DeleteTicketDoc()
  deleteTicket(@Param('id', UUIDValidationPipe) ticketId: string) {
    return this.ticketService.deleteTicket(ticketId);
  }
}
