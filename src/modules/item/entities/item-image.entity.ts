import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ItemEntity } from './item.entity';

@Entity(EntityName.ItemImage)
export class ItemImageEntity extends BaseEntity {
  @Column()
  image: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => ItemEntity, (item) => item.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;
}
