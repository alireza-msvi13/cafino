import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { StorageModule } from '../storage/storage.module';
import { UserModule } from '../user/user.module';
import { ItemModule } from '../item/item.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [UserModule, ItemModule, OrderModule, StorageModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
