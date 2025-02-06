import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ItemImageEntity } from './item-image.entity';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { CartEntity } from 'src/modules/cart/entity/cart.entity';

@Entity(EntityName.Item)
export class ItemEntity extends BaseEntity {

    @Column({ type: 'text' })
    title: string;

    @Column("simple-array", { nullable: true })
    ingredients: string[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal' })
    price: number;

    @Column({ type: 'integer', default: 0 })
    discount: number;

    @Column({ type: 'integer', default: 1 })
    quantity: number;

    @Column({ default: true })
    show: boolean;

    @Column({ type: 'float', default: 5 })
    rate: number;

    @Column({ type: 'integer', default: 1 })
    rateCount: number;


    @OneToMany(() => ItemImageEntity, (image) => image.item)
    images: ItemImageEntity[];

    @ManyToOne(() => CategoryEntity, (category) => category.items, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "category_id" })
    category: CategoryEntity;

    @OneToMany(() => CommentEntity, (comment) => comment.item)
    comments: CommentEntity;

    @OneToMany(() => CartEntity, (cart) => cart.item)
    cart: CartEntity;





    // comments
    // category
}
