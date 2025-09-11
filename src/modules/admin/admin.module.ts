import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ItemModule } from '../item/item.module';
import { OrderModule } from '../order/order.module';
import { UserModule } from '../user/user.module';
import { DiscountModule } from '../discount/discount.module';
import { ContactModule } from '../contact/contact.module';
import { CommentModule } from '../comment/comment.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
    UserModule,
    ItemModule,
    OrderModule,
    ContactModule,
    DiscountModule,
    CommentModule,
    TicketModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
