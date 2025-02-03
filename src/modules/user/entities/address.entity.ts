
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { UserEntity } from "./user.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.UserAddress)
export class UserAddressEntity extends BaseEntity {
  @Column()
  province: string;
  @Column()
  city: string;
  @Column()
  address: string;
  @ManyToOne(() => UserEntity, (user) => user.addressesList, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
  // @OneToMany(() => OrderEntity, (order) => order.address)
  // orders: OrderEntity[];
  @CreateDateColumn()
  created_at: Date;
}
