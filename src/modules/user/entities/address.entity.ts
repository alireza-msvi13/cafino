
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne
} from "typeorm";
import {UserEntity} from "./user.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.UserAddresses)
export class UserAddressesEntity extends BaseEntity {
  @Column()
  province: string;
  @Column()
  city: string;
  @Column()
  address: string;
  @ManyToOne(() => UserEntity, (user) => user.addressesList, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
  // @OneToMany(() => OrderEntity, (order) => order.address)
  // orders: OrderEntity[];
  @CreateDateColumn()
  created_at: Date;
}
