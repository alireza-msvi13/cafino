import { EntityName } from 'src/common/enums/entity.enum';
import { Entity, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Reply } from './reply.entity';
import { BaseEntity } from 'src/common/abstracts/base.entity';

@Entity(EntityName.Contact)
export class Contact extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column('text')
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Reply, (reply) => reply.contact, {
    cascade: true,
  })
  replies: Reply[];
}
