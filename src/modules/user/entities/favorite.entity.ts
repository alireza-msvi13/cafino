import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { ItemEntity } from 'src/modules/item/entities/item.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity(EntityName.Favorite)
export class FavoriteEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => ItemEntity, (item) => item.favorites)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;

  @ManyToOne(() => UserEntity, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
