import { forwardRef, Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { StorageModule } from '../storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './entities/item.entity';
import { CategoryModule } from '../category/category.module';
import { ItemImageEntity } from './entities/item-image.entity';
import { UserModule } from '../user/user.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    StorageModule,
    UserModule,
    OrderModule,
    forwardRef(() => CategoryModule),
    TypeOrmModule.forFeature([ItemEntity, ItemImageEntity]),
  ],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
