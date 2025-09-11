import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { UserModule } from '../user/user.module';
import { TicketMessage } from './entity/ticket-message.entity';
import { Ticket } from './entity/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Ticket, TicketMessage])],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
