import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity(EntityName.Otp)
export class OtpEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 6 })
    code: string;
    @Column({ type: 'varchar', length: 15 })
    phone: string;
    @Column({ type: 'timestamp' })
    expires_in: Date;
    @Column({ default: false })
    is_used: boolean;
    @Column({ type: 'timestamp', nullable: true })
    last_requested_at: Date;
    @Column({ default: 0 })
    request_count: number;
    @OneToOne(() => UserEntity, user => user.otp, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

}
