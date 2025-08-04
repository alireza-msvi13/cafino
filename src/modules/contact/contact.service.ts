import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { Reply } from './entities/reply.entity';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { ContactQueryDto } from './dto/sort-contact.dto';

@Injectable()
export class ContactService {

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Reply)
    private replyRepository: Repository<Reply>,
  ) { }


  async create(createContactDto: CreateContactDto) {
    const { name, email, phone, message } = createContactDto;
    const contact = this.contactRepository.create({ name, email, phone, message });
    await this.contactRepository.save(contact);

    return {
      statusCode: HttpStatus.CREATED,
      message: "Your message was sent successfully",
    };
  }

  async findAll(query: ContactQueryDto) {
    const { sortBy, order, hasReply, name, email, phone } = query;


    const qb = this.contactRepository.createQueryBuilder('contact')
      .leftJoinAndSelect('contact.replies', 'reply');


    if (name) {
      qb.andWhere('LOWER(contact.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }
    if (email) {
      qb.andWhere('LOWER(contact.email) LIKE LOWER(:email)', { email: `%${email}%` });
    }
    if (phone) {
      qb.andWhere('contact.phone LIKE :phone', { phone: `%${phone}%` });
    }


    if (hasReply !== undefined) {
      if (hasReply) {
        qb.andWhere('reply.id IS NOT NULL');
      } else {
        qb.andWhere('reply.id IS NULL');
      }
    }


    if (sortBy === 'hasReply') {
      qb.addSelect('COUNT(reply.id)', 'replyCount')
        .groupBy('contact.id')
        .orderBy('replyCount', order);
    } else {
      qb.orderBy(`contact.${sortBy}`, order);
    }

    const contacts = await qb.getMany();

    return {
      statusCode: HttpStatus.OK,
      message: 'Contact messages fetched successfully',
      data: contacts,
    };
  }

  async reply(contactId: string, dto: ReplyContactDto) {
    const { subject, message } = dto
    const contact = await this.contactRepository.findOneBy({ id: contactId });
    if (!contact) throw new NotFoundException('Contact not found');

    const reply = this.replyRepository.create({ message, contact, subject });
    await this.replyRepository.save(reply);

    // await this.mailerService.sendReplyEmail(contact.email, subject, message);

    return {
      statusCode: HttpStatus.OK,
      message: "Your message was sent successfully",
    };
  }

  async getReplies(contactId: string) {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ['repliess'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Contact messages fetched successfully",
      data: contact.replies
    };
  }


}
