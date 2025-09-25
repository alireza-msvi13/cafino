import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { TicketStatus } from '../enum/ticket.enum';
import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TicketMessage } from './ticket-message.entity';

@Entity(EntityName.Ticket)
export class Ticket extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.Open,
  })
  status: TicketStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => UserEntity, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => TicketMessage, (message) => message.ticket, {
    cascade: ['soft-remove'],
  })
  messages: TicketMessage[];
}
