
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { CartEntity } from "src/modules/cart/entity/cart.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.Discount)
export class DiscountEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'integer', nullable: true })
  percent: number;

  @Column({ type: 'integer', nullable: true })
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_in: Date;

  @Column({ type: 'integer', nullable: true })
  limit: number;

  @Column({ type: 'integer', nullable: true, default: 0 })
  usage: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => CartEntity, (cart) => cart.discount)
  carts: CartEntity[];
}
