import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ItemImageEntity } from './item-image.entity';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { CartEntity } from 'src/modules/cart/entity/cart.entity';
import { FavoriteEntity } from 'src/modules/user/entities/favorite.entity';
import { OrderItemEntity } from 'src/modules/order/entity/order-items.entity';

@Entity(EntityName.Item)
export class ItemEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column('simple-array', { nullable: true })
  ingredients: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer', default: 0 })
  price: number;

  @Column({ type: 'smallint', default: 0 })
  discount: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ type: 'real', default: 5 })
  rate: number;

  @Column({ type: 'integer', default: 1 })
  rate_count: number;

  @Column({ type: 'boolean', default: true })
  show: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => ItemImageEntity, (image) => image.item, {
    cascade: ['soft-remove'],
  })
  images: ItemImageEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.items)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.item)
  comments: CommentEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.item, {
    cascade: ['soft-remove'],
  })
  cart: CartEntity[];

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.item, {
    cascade: ['soft-remove'],
  })
  favorites: FavoriteEntity[];

  @OneToMany(() => OrderItemEntity, (order) => order.item)
  orders: OrderItemEntity[];
}
