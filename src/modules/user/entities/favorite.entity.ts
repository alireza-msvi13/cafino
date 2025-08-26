import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { ItemEntity } from "src/modules/item/entities/item.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity(EntityName.FAVORITE)
export class FavoriteEntity extends BaseEntity {
  @ManyToOne(() => ItemEntity, (item) => item.favorites, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;
  @ManyToOne(() => UserEntity, (user) => user.favorites, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
