import { forwardRef, Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { StorageModule } from '../storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './entities/item.entity';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    StorageModule,
    CategoryModule,
    TypeOrmModule.forFeature([ItemEntity])],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule { }
