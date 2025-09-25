import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { OrderItemEntity } from './order-items.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { BaseEntity } from 'src/common/abstracts/base.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AddressEntity } from 'src/modules/user/entities/address.entity';
import { PaymentEntity } from 'src/modules/payment/entity/payment.entity';
import { DiscountEntity } from 'src/modules/discount/entity/discount.entity';

@Entity(EntityName.Order)
export class OrderEntity extends BaseEntity {
  @Column({ type: 'integer' })
  payment_amount: number;

  @Column({ type: 'integer' })
  discount_amount: number;

  @Column({ type: 'integer' })
  total_amount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => AddressEntity, (address) => address.orders)
  @JoinColumn({ name: 'address_id' })
  address: AddressEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items: OrderItemEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.order)
  payments: PaymentEntity[];

  @ManyToOne(() => DiscountEntity, (discount) => discount.orders)
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;
}
