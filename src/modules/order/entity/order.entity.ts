import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { OrderItemEntity } from "./order-items.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { OrderStatus } from "src/common/enums/order-status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { AddressEntity } from "src/modules/user/entities/address.entity";
import { PaymentEntity } from "src/modules/payment/entity/payment.entity";

@Entity(EntityName.Order)
export class OrderEntity extends BaseEntity {

  @Column()
  payment_amount: number;

  @Column()
  discount_amount: number;

  @Column()
  total_amount: number;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Pending })
  status: string;

  @Column({ nullable: true })
  description: string;


  @ManyToOne(() => UserEntity, (user) => user.orders, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => AddressEntity, (address) => address.orders, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "address_id" })
  address: AddressEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items: OrderItemEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.order)
  payments: PaymentEntity[];
}
