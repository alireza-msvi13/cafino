
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import {
  Column,
  Entity,
} from "typeorm";

@Entity(EntityName.Category)
export class CategoryEntity extends BaseEntity {
  @Column({ unique: true })
  title: string;
  @Column({ unique: true })
  slug: string;
  @Column()
  image: string;
  @Column()
  imageUrl: string;
  @Column()
  show: boolean;
}
