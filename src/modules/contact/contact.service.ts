import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { Reply } from './entities/reply.entity';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { ContactQueryDto } from './dto/sort-contact.dto';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { MailService } from '../mail/mail.service';
import { SortContactOption } from './enum/contact.enum';
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Reply)
    private replyRepository: Repository<Reply>,
    private readonly mailService: MailService,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    identifier: string,
  ): Promise<ServerResponse> {
    const { name, email, phone, message } = createContactDto;
    const contact = this.contactRepository.create({
      identifier,
      name,
      email,
      phone,
      message,
    });
    await this.contactRepository.save(contact);

    return new ServerResponse(
      HttpStatus.CREATED,
      'Your message was sent successfully.',
    );
  }
  async findAll(query: ContactQueryDto) {
    const { sortBy, hasReply, identifier, name, email, phone, page, limit } =
      query;

    const qb = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.replies', 'reply')
      .skip((page - 1) * limit)
      .take(limit);

    if (identifier) {
      qb.andWhere('LOWER(contact.identifier) LIKE LOWER(:identifier)', {
        identifier: `%${identifier}%`,
      });
    }

    if (name) {
      qb.andWhere('LOWER(contact.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }
    if (email) {
      qb.andWhere('LOWER(contact.email) LIKE LOWER(:email)', {
        email: `%${email}%`,
      });
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

    switch (sortBy) {
      case SortContactOption.Newest:
        qb.orderBy('contact.created_at', 'DESC');
        break;
      case SortContactOption.Oldest:
        qb.orderBy('contact.created_at', 'ASC');
        break;
      default:
        qb.orderBy('contact.created_at', 'DESC');
    }

    const contacts = await qb.getMany();
    const totalUnreplied = await this.countUnrepliedMessages();

    return new ServerResponse(
      HttpStatus.OK,
      'Contact messages fetched successfully.',
      { total: contacts.length, totalUnreplied, contacts },
    );
  }
  async reply(contactId: string, dto: ReplyContactDto) {
    const { subject, message } = dto;
    const contact = await this.contactRepository.findOneBy({ id: contactId });
    if (!contact) throw new NotFoundException('Contact not found.');

    const reply = this.replyRepository.create({ message, contact, subject });
    await this.replyRepository.save(reply);

    await this.mailService.sendReplyEmail(contact.email, subject, message);

    return new ServerResponse(
      HttpStatus.OK,
      'Your message was sent successfully.',
    );
  }
  async getReplies(contactId: string) {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ['replies'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found.');
    }

    return new ServerResponse(
      HttpStatus.OK,
      'Contact messages fetched successfully.',
      { replies: contact.replies },
    );
  }
  async delete(contactId: string): Promise<ServerResponse> {
    const contact = await this.contactRepository.findOneBy({ id: contactId });
    if (!contact) {
      throw new NotFoundException('Contact not found.');
    }

    await this.contactRepository.remove(contact);

    return new ServerResponse(
      HttpStatus.OK,
      'Contact message deleted successfully.',
    );
  }

  // * admin dashboard reports

  async countMessages(): Promise<number> {
    return this.contactRepository.count();
  }
  async countUnrepliedMessages(): Promise<number> {
    return this.contactRepository
      .createQueryBuilder('contact')
      .leftJoin('contact.replies', 'reply')
      .where('reply.id IS NULL')
      .getCount();
  }
}
