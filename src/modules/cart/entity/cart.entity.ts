
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { DiscountEntity } from "src/modules/discount/entity/discount.entity";
import { ItemEntity } from "src/modules/item/entities/item.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity(EntityName.CART)
export class CartEntity extends BaseEntity {
  @Column({ type: 'integer', default: 1 })
  count: number;
  @ManyToOne(() => ItemEntity, (item) => item.cart, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;
  @ManyToOne(() => UserEntity, (user) => user.carts, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @ManyToOne(() => DiscountEntity, (discount) => discount.carts, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;
}
