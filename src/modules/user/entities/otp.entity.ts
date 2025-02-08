import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity(EntityName.Otp)
export class OtpEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 6 })
    code: string;
    @Column({ type: 'varchar', length: 15 })
    phone: string;
    @Column({ type: 'timestamp' })
    expires_in: Date;
    @OneToOne(() => UserEntity, (user) => user.otp)
    user: UserEntity;
}
