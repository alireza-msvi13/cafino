import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { OrderEntity } from 'src/modules/order/entity/order.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity(EntityName.Payment)
export class PaymentEntity extends BaseEntity {
  @Column({ default: false })
  status: boolean;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'varchar', length: 100 })
  invoice_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  authority: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  card_pan: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  card_hash: string;

  @Column({ type: 'integer', nullable: true })
  ref_id: number;

  @ManyToOne(() => OrderEntity, (order) => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => UserEntity, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
