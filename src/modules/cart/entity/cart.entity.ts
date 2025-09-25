import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { DiscountEntity } from 'src/modules/discount/entity/discount.entity';
import { ItemEntity } from 'src/modules/item/entities/item.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity(EntityName.Cart)
export class CartEntity extends BaseEntity {
  @Column({ type: 'integer', default: 1 })
  count: number;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => ItemEntity, (item) => item.cart)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;

  @ManyToOne(() => UserEntity, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => DiscountEntity, (discount) => discount.carts)
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;
}
