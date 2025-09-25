import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ItemEntity } from './item.entity';

@Entity(EntityName.ItemImage)
export class ItemImageEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => ItemEntity, (item) => item.images)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;
}
