import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { TicketStatus } from '../enum/ticket.enum';
import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TicketMessage } from './ticket-message.entity';

@Entity(EntityName.Ticket)
export class Ticket extends BaseEntity {
  @Column()
  subject: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.Open,
  })
  status: TicketStatus;

  @ManyToOne(() => UserEntity, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => TicketMessage, (message) => message.ticket, {
    cascade: true,
  })
  messages: TicketMessage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
