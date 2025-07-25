import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { ItemEntity } from "src/modules/item/entities/item.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";


@Entity(EntityName.Comment)
export class CommentEntity extends BaseEntity {
    @Column({ type: 'text' })
    text: string;
    @Column({ type: 'boolean', default: false })
    accept: boolean;
    @Column({ type: "integer", nullable: true })
    star: number;
    @ManyToOne(() => UserEntity, user => user.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: UserEntity;
    @ManyToOne(() => ItemEntity, item => item.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "item_id" })
    item: ItemEntity;
    @ManyToOne(() => CommentEntity, parent => parent.children, { onDelete: "CASCADE" })
    @JoinColumn({ name: "parent_id" })
    parent: CommentEntity;
    @OneToMany(() => CommentEntity, comment => comment.parent)
    children: CommentEntity[]
    @CreateDateColumn()
    created_at: Date;
}

