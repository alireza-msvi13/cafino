import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { Ticket } from './entity/ticket.entity';
import { TicketMessage } from './entity/ticket-message.entity';
import { SortTicketDto } from './dto/sort-ticket.dto';
import { SortTicket, TicketStatus } from './enum/ticket.enum';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { Roles } from 'src/common/enums/role.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private messageRepo: Repository<TicketMessage>,
  ) {}

  async createTicket(
    userId: string,
    createDto: CreateTicketDto,
  ): Promise<ServerResponse> {
    const ticket = this.ticketRepo.create({
      subject: createDto.subject,
      user: { id: userId },
      messages: [
        this.messageRepo.create({
          message: createDto.message,
          sender: { id: userId },
        }),
      ],
    });
    await this.ticketRepo.save(ticket);

    return new ServerResponse(
      HttpStatus.CREATED,
      'Ticket created successfully.',
    );
  }
  async findAllTickets(
    query: SortTicketDto,
    userId?: string,
  ): Promise<ServerResponse> {
    const { sortBy, status, page, limit } = query;

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .select([
        'ticket.id',
        'ticket.subject',
        'ticket.status',
        'ticket.created_at',
        'user.id',
        'user.username',
        'user.first_name',
        'user.last_name',
        'user.imageUrl',
        'user.role',
      ])
      .orderBy(
        'ticket.created_at',
        sortBy === SortTicket.Newest ? 'DESC' : 'ASC',
      )
      .skip((page - 1) * limit)
      .take(limit);

    if (userId) {
      qb.andWhere('user.id = :userId', { userId });
    }

    if (status) {
      qb.andWhere('ticket.status = :status', { status });
    }

    const [total, tickets] = await Promise.all([qb.getCount(), qb.getMany()]);

    return new ServerResponse(HttpStatus.OK, 'Tickets fetched successfully.', {
      total,
      tickets,
    });
  }
  async getMessages(
    ticketId: string,
    userId: string,
    role: Roles,
  ): Promise<ServerResponse> {
    const ticket = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoin('ticket.user', 'user')
      .select([
        'ticket.id',
        'ticket.subject',
        'ticket.status',
        'ticket.created_at',
        'user.id',
        'user.username',
        'user.first_name',
        'user.last_name',
        'user.imageUrl',
        'user.role',
      ])
      .where('ticket.id = :ticketId', { ticketId })
      .getOne();

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    if (role !== Roles.Admin && ticket.user.id !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    const messages = await this.messageRepo
      .createQueryBuilder('message')
      .leftJoin('message.ticket', 'ticket')
      .leftJoin('message.sender', 'sender')
      .where('ticket.id = :ticketId', { ticketId })
      .select([
        'message.id',
        'message.message',
        'message.created_at',
        'sender.id',
        'sender.username',
        'sender.first_name',
        'sender.last_name',
        'sender.imageUrl',
        'sender.role',
      ])
      .orderBy('message.created_at', 'ASC')
      .getMany();

    return new ServerResponse(HttpStatus.OK, 'Messages fetched successfully.', {
      ticket,
      messages,
    });
  }
  async addMessage(
    dto: AddMessageDto,
    ticketId: string,
    userId: string,
    role: Roles,
  ): Promise<ServerResponse> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['user'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found.');

    if (ticket.status === TicketStatus.Closed) {
      throw new ConflictException('Ticket is closed.');
    }

    if (role !== Roles.Admin && ticket.user.id !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    if (role === Roles.Admin && ticket.status === TicketStatus.Open) {
      ticket.status = TicketStatus.Answered;
      await this.ticketRepo.save(ticket);
    }

    if (role === Roles.User && ticket.status === TicketStatus.Answered) {
      ticket.status = TicketStatus.Open;
      await this.ticketRepo.save(ticket);
    }

    const message = this.messageRepo.create({
      message: dto.message,
      ticket,
      sender: { id: userId },
    });

    await this.messageRepo.save(message);

    return new ServerResponse(HttpStatus.CREATED, 'Message sent successfully.');
  }
  async closeTicket(ticketId: string): Promise<ServerResponse> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found.');

    ticket.status = TicketStatus.Closed;
    await this.ticketRepo.save(ticket);
    return new ServerResponse(HttpStatus.OK, 'Ticket closed successfully.');
  }
  async deleteTicket(ticketId: string): Promise<ServerResponse> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['messages'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found.');
    await this.ticketRepo.softRemove(ticket);
    return new ServerResponse(HttpStatus.OK, 'Ticket deleted successfully.');
  }
  async countTickets(): Promise<number> {
    return this.ticketRepo.count();
  }
  async countOpenTickets(): Promise<number> {
    return this.ticketRepo.count({ where: { status: TicketStatus.Open } });
  }
  async countClosedTickets(): Promise<number> {
    return this.ticketRepo.count({ where: { status: TicketStatus.Closed } });
  }
  async countAnsweredTickets(): Promise<number> {
    return this.ticketRepo.count({ where: { status: TicketStatus.Answered } });
  }
  async countUserTickets(userId: string): Promise<number> {
    return this.ticketRepo.count({ where: { user: { id: userId } } });
  }
  async countUserOpenTickets(userId: string): Promise<number> {
    return this.ticketRepo.count({
      where: { user: { id: userId }, status: TicketStatus.Open },
    });
  }
}
