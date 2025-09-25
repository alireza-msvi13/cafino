import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Contact } from './contact.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { BaseEntity } from 'src/common/abstracts/base.entity';

@Entity(EntityName.ContactReply)
export class Reply extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @Column('text')
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => Contact, (contact) => contact.replies)
  contact: Contact;
}
