import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TypeOrmConfig } from './configs/typeorm.config';
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
import { ContactModule } from './modules/contact/contact.module';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './common/logger/winston.logger';
import { AppController } from './app.controller';
import { MailModule } from './modules/mail/mail.module';
import { AdminModule } from './modules/admin/admin.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './modules/tasks/tasks.module';
import { CaptchaModule } from './modules/captcha/captcha.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    WinstonModule.forRoot({
      transports: winstonLogger.transports,
    }),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
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
    GatewayModule,
    ContactModule,
    MailModule,
    AdminModule,
    RateLimitModule,
    TicketModule,
    TasksModule,
    CaptchaModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
