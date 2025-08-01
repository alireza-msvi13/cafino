import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TypeOrmConfig } from './config/typeorm/typeorm.config';
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
import { GatewayModule } from './modules/gateway/gateway.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env')
    }),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    UserModule,
    AuthModule,
    SmsModule,
    StorageModule,
    CategoryModule,
    ItemModule,
    CommentModule,
    CartModule,
    DiscountModule,
    ProfileModule,
    OrderModule,
    PaymentModule,
    GatewayModule
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
