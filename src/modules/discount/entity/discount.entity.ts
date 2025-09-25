import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { CartEntity } from 'src/modules/cart/entity/cart.entity';
import { OrderEntity } from 'src/modules/order/entity/order.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
} from 'typeorm';

@Entity(EntityName.Discount)
export class DiscountEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'integer', nullable: true })
  percent: number;

  @Column({ type: 'integer', nullable: true })
  amount: number;

  @Column({ type: 'timestamptz' })
  expires_in: Date;

  @Column({ type: 'integer', nullable: true })
  limit: number;

  @Column({ type: 'integer', nullable: true, default: 0 })
  usage: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => CartEntity, (cart) => cart.discount)
  carts: CartEntity[];

  @OneToMany(() => OrderEntity, (order) => order.discount)
  orders: OrderEntity[];
}
