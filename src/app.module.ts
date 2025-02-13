import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TypeOrmConfig } from './common/config/typeorm/typeorm.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SmsModule } from './modules/sms/sms.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { StorageModule } from './modules/storage/storage.module';
import { CategoryModule } from './modules/category/category.module';
import { ItemModule } from './modules/item/item.module';
import { CommentModule } from './modules/comment/comment.module';
import { CartModule } from './modules/cart/cart.module';
import { DiscountModule } from './modules/discount/discount.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env')
    }),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    UserModule,
    AuthModule,
    SmsModule,
    StorageModule,
    CategoryModule,
    ItemModule,
    CommentModule,
    CartModule,
    DiscountModule,
    ProfileModule
    
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
