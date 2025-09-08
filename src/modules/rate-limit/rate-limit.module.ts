import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimitRecord } from './entity/rate-limit.entity';
import { RateLimitService } from './rate-limit.service';
import { RateLimitController } from './rate-limit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RateLimitRecord])],
  controllers: [RateLimitController],
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class RateLimitModule {}
