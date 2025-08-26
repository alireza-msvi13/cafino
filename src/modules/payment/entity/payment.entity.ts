
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { OrderEntity } from "src/modules/order/entity/order.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from "typeorm";

@Entity(EntityName.PAYMENT)
export class PaymentEntity extends BaseEntity {

  @Column({ default: false })
  status: boolean;

  @Column()
  amount: number;

  @Column()
  invoice_number: string;

  @Column({ nullable: true })
  authority: string;

  @Column({ nullable: true })
  card_pan: string;

  @Column({ nullable: true })
  card_hash: string;

  @Column({ nullable: true })
  ref_id: number;

  @ManyToOne(() => OrderEntity, (order) => order.payments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: OrderEntity;

  @ManyToOne(() => UserEntity, (user) => user.payments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
  updated_at: Date;
}
