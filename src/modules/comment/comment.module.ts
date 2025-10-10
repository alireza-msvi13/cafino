import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { ItemModule } from '../item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [
    RateLimitModule,
    ItemModule,
    TypeOrmModule.forFeature([CommentEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
