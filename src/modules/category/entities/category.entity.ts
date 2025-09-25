import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { ItemEntity } from 'src/modules/item/entities/item.entity';
import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';

@Entity(EntityName.Category)
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ default: true })
  show: boolean;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => ItemEntity, (item) => item.category, {
    cascade: ['soft-remove'],
  })
  items: ItemEntity[];
}
