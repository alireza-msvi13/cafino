import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { BaseEntity } from 'src/common/abstracts/base.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { EntityName } from 'src/common/enums/entity.enum';

@Entity(EntityName.TicketMessage)
export class TicketMessage extends BaseEntity {
  @Column('text')
  message: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: 'user_id' })
  sender: UserEntity;

  @CreateDateColumn()
  created_at: Date;
}
