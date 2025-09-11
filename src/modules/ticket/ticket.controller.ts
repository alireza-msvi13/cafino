import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Req,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { SortTicketDto } from './dto/sort-ticket.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from 'src/common/enums/role.enum';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';

@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Create a new ticket.' })
  createTicket(
    @GetUser('id', UUIDValidationPipe) userId: string,
    @Body() createDto: CreateTicketDto,
  ) {
    return this.ticketService.createTicket(userId, createDto);
  }

  @Get()
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all tickets By Admin.' })
  findAllTicketsByAdmin(@Query() query: SortTicketDto) {
    return this.ticketService.findAllTickets(query);
  }

  @Get('user')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get all user tickets.' })
  findAllUserTickets(
    @GetUser('id', UUIDValidationPipe) userId: string,
    @Query() query: SortTicketDto,
  ) {
    return this.ticketService.findAllTickets(query, userId);
  }

  @Get(':id/messages')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get all messages for a ticket.' })
  getMessages(
    @Param('id', UUIDValidationPipe) id: string,
    @GetUser('id', UUIDValidationPipe) userId: string,
    @GetUser('role') role: Roles,
  ) {
    return this.ticketService.getMessages(id, userId, role);
  }

  @Post(':id/messages')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Add a message to a ticket.' })
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
  @ApiOperation({ summary: 'Close a ticket By Admin.' })
  closeTicket(@Param('id', UUIDValidationPipe) ticketId: string) {
    return this.ticketService.closeTicket(ticketId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete a ticket By Admin.' })
  deleteTicket(@Param('id', UUIDValidationPipe) ticketId: string) {
    return this.ticketService.deleteTicket(ticketId);
  }
}
