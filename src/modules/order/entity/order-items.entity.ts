import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { BaseEntity } from 'src/common/abstracts/base.entity';
import { ItemEntity } from 'src/modules/item/entities/item.entity';

@Entity(EntityName.OrderItem)
export class OrderItemEntity extends BaseEntity {
  @Column({ type: 'integer' })
  count: number;

  @ManyToOne(() => ItemEntity, (item) => item.orders)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;
}
