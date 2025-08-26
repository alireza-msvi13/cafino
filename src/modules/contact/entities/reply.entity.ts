import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Contact } from './contact.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.CONTACT_REPLY)
export class Reply extends BaseEntity {

    @Column()
    subject: string;

    @Column('text')
    message: string;

    @CreateDateColumn()
    created_at: Date

    @ManyToOne(() => Contact, (contact) => contact.replies, {
        onDelete: 'CASCADE',
    })
    contact: Contact;
}
