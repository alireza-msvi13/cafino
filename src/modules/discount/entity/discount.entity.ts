
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { CartEntity } from "src/modules/cart/entity/cart.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.Discount)
export class DiscountEntity extends BaseEntity {
  @Column({ unique: true })
  code: string;
  @Column({ type: "float", nullable: true })
  percent: number;
  @Column({ type: "float", nullable: true })
  amount: number;
  @Column({ nullable: true })
  expires_in: Date;
  @Column({ nullable: true })
  limit: number;
  @Column({ nullable: true, default: 0 })
  usage: number;
  @Column({ default: true })
  active: boolean;
  @OneToMany(() => CartEntity, (cart) => cart.discount)
  carts: CartEntity[];
}
