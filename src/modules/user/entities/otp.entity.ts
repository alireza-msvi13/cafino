import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity(EntityName.Otp)
export class OtpEntity extends BaseEntity {
    @Column()
    code: string;
    @Column()
    phone: string;
    @Column()
    expires_in: Date;
    @OneToOne(() => UserEntity, (user) => user.otp, { onDelete: "CASCADE" })
    user: UserEntity;
}
