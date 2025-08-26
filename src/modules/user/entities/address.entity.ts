
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { UserEntity } from "./user.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { OrderEntity } from "src/modules/order/entity/order.entity";

@Entity(EntityName.ADDRESS)
export class AddressEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  province: string;
  @Column({ type: 'varchar', length: 100 })
  city: string;
  @Column({ type: 'text' })
  address: string;
  @ManyToOne(() => UserEntity, (user) => user.addressList, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
  @OneToMany(() => OrderEntity, (order) => order.address)
  orders: OrderEntity[];
  @CreateDateColumn()
  created_at: Date;
}
