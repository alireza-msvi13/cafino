import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { ItemImageEntity } from './item-image.entity';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { CartEntity } from 'src/modules/cart/entity/cart.entity';
import { FavoriteEntity } from 'src/modules/user/entities/favorite.entity';
import { OrderItemEntity } from 'src/modules/order/entity/order-items.entity';

@Entity(EntityName.Item)
export class ItemEntity extends BaseEntity {

    @Column({ type: 'text' })
    title: string;

    @Column("simple-array", { nullable: true })
    ingredients: string[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
    discount: number;

    @Column({ type: 'integer', default: 1 })
    quantity: number;

    @Column({ type: 'real', default: 5 })
    rate: number;

    @Column({ type: 'integer', default: 1 })
    rate_count: number;

    @Column({ type: 'boolean', default: true })
    show: boolean;

    @OneToMany(() => ItemImageEntity, (image) => image.item)
    images: ItemImageEntity[];

    @ManyToOne(() => CategoryEntity, (category) => category.items, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "category_id" })
    category: CategoryEntity;

    @OneToMany(() => CommentEntity, (comment) => comment.item)
    comments: CommentEntity[];

    @OneToMany(() => CartEntity, (cart) => cart.item)
    cart: CartEntity[];

    @OneToMany(() => FavoriteEntity, (favorite) => favorite.item)
    favorites: FavoriteEntity[];

    @OneToMany(() => OrderItemEntity, (order) => order.item)
    orders: OrderItemEntity[];



    @CreateDateColumn()
    createdAt: Date;



    // comments
    // category
}
