import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne } from 'typeorm';

@Entity(EntityName.Item)
export class ItemEntity extends BaseEntity {

    @Column({ type: 'text' })
    title: string;

    @Column("simple-array", { nullable: true })
    ingredients: string[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'integer', default: 0 })
    discount: number;

    @Column({ type: 'integer', default: 1 })
    quantity: number;

    @Column("simple-array", { nullable: true })
    images: string[];

    @Column("simple-array", { nullable: true })
    imagesUrl: string[];

    @Column({ type: 'float', default: 5 })
    rate: number;

    @Column({ type: 'integer', default: 1 })
    rateCount: number;

    @ManyToOne(() => CategoryEntity, (category) => category.items, {
        onDelete: "CASCADE",
    })
    category: CategoryEntity;



    // comments
    // category
}
