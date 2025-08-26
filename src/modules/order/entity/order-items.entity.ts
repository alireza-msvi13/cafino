import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { ItemEntity } from "src/modules/item/entities/item.entity";

@Entity(EntityName.ORDER_ITEM)
export class OrderItemEntity extends BaseEntity {

  @Column()
  count: number;

  @ManyToOne(() => ItemEntity, (item) => item.orders, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "item_id" })
  item: ItemEntity;

  @ManyToOne(() => OrderEntity, (order) => order.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: OrderEntity;


}
