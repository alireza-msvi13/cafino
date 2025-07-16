import { BaseEntity } from "src/common/abstracts/base.entity";
import { BlockStatus } from "src/modules/rate-limit/enums/block-status.enum";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, Index, UpdateDateColumn } from "typeorm";

@Entity(EntityName.RateLimitRecord)
@Index(['identifier', 'endpoint'], { unique: true })
export class RateLimitRecord extends BaseEntity {
    @Column()
    identifier: string;

    @Column()
    endpoint: string;

    @Column({ default: 0 })
    violation_count: number;

    @Column({ type: 'timestamp' })
    window_start_at: Date;

    @Column({ default: 0 })
    requests_in_window: number;

    @Column({
        type: 'enum',
        enum: BlockStatus,
        default: BlockStatus.NONE,
    })
    block_status: BlockStatus;

    @Column({ type: 'timestamp', nullable: true })
    block_expires_at: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    violation_count_reset_at: Date | null;

    @CreateDateColumn()
    created_at: Date
    
    @UpdateDateColumn()
    updated_at: Date

}
