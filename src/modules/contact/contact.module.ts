import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Reply } from './entities/reply.entity';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [
    RateLimitModule,
    TypeOrmModule.forFeature([Contact, Reply])
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule { }
