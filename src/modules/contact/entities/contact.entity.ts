import { EntityName } from 'src/common/enums/entity.enum';
import {
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Reply } from './reply.entity';
import { BaseEntity } from 'src/common/abstracts/base.entity';

@Entity(EntityName.Contact)
export class Contact extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  identifier: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column('text')
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => Reply, (reply) => reply.contact, {
    cascade: true,
  })
  replies: Reply[];
}
