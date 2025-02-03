
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { OtpEntity } from "./otp.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Roles } from "src/common/enums/role.enum";
import { UserStatus } from "../enum/status.enum";
import { UserAddressEntity } from "./address.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
    @Column({ unique: true, nullable: true })
    username: string;
    @Column({ nullable: true })
    first_name: string;
    @Column({ nullable: true })
    last_name: string;
    @Column({ nullable: true })
    birthday: Date;
    @Column({ nullable: true })
    imageUrl: string;
    @Column({ unique: true })
    phone: string;
    @Column({ unique: true, nullable: true })
    email: string;
    @Column({ default: Roles.User })
    role: string;
    @Column({ nullable: true })
    new_email: string;
    @Column({ nullable: true })
    new_phone: string;
    @Column({ nullable: true, default: false })
    is_email_verified: boolean;
    @Column({ enum: UserStatus, default: UserStatus.Normal })
    status: string;

    @Column({ nullable: true })
    rt_hash: string;
    // @Column({ nullable: true })
    // favoriteFoods: string[];
    // @Column({ nullable: true })
    // comments: string[]; 
    @OneToOne(() => OtpEntity, otp => otp.user, { nullable: true })
    @JoinColumn({ name: "otp_id" })
    otp: OtpEntity
    @OneToMany(() => UserAddressEntity, (addresses) => addresses.user)
    addressesList: UserAddressEntity[];
    @CreateDateColumn()

    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
}
