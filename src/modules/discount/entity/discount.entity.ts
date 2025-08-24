
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { CartEntity } from "src/modules/cart/entity/cart.entity";
import { Column, CreateDateColumn, Entity, OneToMany } from "typeorm";

@Entity(EntityName.Discount)
export class DiscountEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'integer', nullable: true })
  percent: number;

  @Column({ type: 'integer', nullable: true })
  amount: number;

  @Column({ type: 'timestamp'})
  expires_in: Date;

  @Column({ type: 'integer', nullable: true })
  limit: number;

  @Column({ type: 'integer', nullable: true, default: 0 })
  usage: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => CartEntity, (cart) => cart.discount)
  carts: CartEntity[];

  @CreateDateColumn()
  created_at: Date
}
