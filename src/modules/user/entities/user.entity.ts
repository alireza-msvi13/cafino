import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { OtpEntity } from './otp.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { Roles } from 'src/common/enums/role.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { AddressEntity } from './address.entity';
import { BaseEntity } from 'src/common/abstracts/base.entity';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { CartEntity } from 'src/modules/cart/entity/cart.entity';
import { FavoriteEntity } from './favorite.entity';
import { OrderEntity } from 'src/modules/order/entity/order.entity';
import { TicketMessage } from 'src/modules/ticket/entity/ticket-message.entity';
import { Ticket } from 'src/modules/ticket/entity/ticket.entity';
import { PaymentEntity } from 'src/modules/payment/entity/payment.entity';

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', unique: true, length: 15 })
  phone: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.User })
  role: Roles;

  @Column({ type: 'varchar', length: 255, nullable: true })
  new_email: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  new_phone: string;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.Normal })
  status: UserStatus;

  @Column({ type: 'text', nullable: true })
  rt_hash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => OtpEntity, (otp) => otp.user)
  otp: OtpEntity;

  @OneToMany(() => AddressEntity, (address) => address.user)
  addressList: AddressEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.user)
  carts: CartEntity[];

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.user)
  favorites: FavoriteEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => TicketMessage, (message) => message.sender)
  messages: TicketMessage[];
}
