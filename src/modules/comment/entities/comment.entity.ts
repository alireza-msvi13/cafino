import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { ItemEntity } from 'src/modules/item/entities/item.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity(EntityName.Comment)
export class CommentEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  text: string;

  @Column({ type: 'boolean', default: false })
  accept: boolean;

  @Column({ type: 'integer', nullable: true })
  star: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ItemEntity, (item) => item.comments)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;

  @ManyToOne(() => CommentEntity, (parent) => parent.children)
  @JoinColumn({ name: 'parent_id' })
  parent: CommentEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  children: CommentEntity[];
}
