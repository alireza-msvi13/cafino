import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateLimitRecord } from './entity/rate-limit.entity';
import { Repository } from 'typeorm';
import { BlockStatus } from 'src/modules/rate-limit/enums/block-status.enum';
import { BlockUserDto, RateLimitQueryDto } from './dto/rate-limit-query.dto';
import { Response } from 'express';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';

@Injectable()
export class RateLimitService {

    private readonly RESET_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    private readonly MANUAL_BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 1 days

    constructor(
        @InjectRepository(RateLimitRecord)
        private readonly rateLimitRepository: Repository<RateLimitRecord>,
    ) { }


    // * rate limit logic

    async action(identifier: string, endpoint: string, max: number, duration: number) {
        const now = new Date();
        let record = await this.rateLimitRepository.findOne({ where: { identifier, endpoint } });

        if (!record) {
            record = this.rateLimitRepository.create({
                identifier,
                endpoint,
                requests_in_window: 1,
                window_start_at: now,
                block_status: BlockStatus.NONE,
                block_expires_at: null,
                violation_count: 0,
            });
            await this.rateLimitRepository.save(record);
            return;
        }

        if (record.block_status === BlockStatus.PERMANENT) this.throwBlocked(record);

        if (record.violation_count_reset_at && now > record.violation_count_reset_at) {
            record.violation_count = 0;
            record.violation_count_reset_at = null;
        }

        if (
            record.block_status === BlockStatus.TEMPORARY &&
            record.block_expires_at !== null &&
            now < record.block_expires_at
        ) {
            this.throwBlocked(record);
        }

        const periodEnd = new Date(record.window_start_at.getTime() + duration * 60 * 1000);

        if (now > periodEnd) {
            record.requests_in_window = 1;
            record.window_start_at = now;
            record.block_status = BlockStatus.NONE;
            record.block_expires_at = null;
        } else {
            if (record.requests_in_window >= max) {
                record.violation_count += 1;
                record.requests_in_window = 0;
                record.violation_count_reset_at = new Date(now.getTime() + this.RESET_INTERVAL_MS);

                if (record.violation_count >= 5) {
                    record.block_status = BlockStatus.PERMANENT;
                    record.block_expires_at = null;
                } else {
                    record.block_status = BlockStatus.TEMPORARY;
                    record.block_expires_at = new Date(now.getTime() + this.getBlockDuration(record.violation_count));
                }
            } else {
                record.requests_in_window += 1;
            }
        }

        await this.rateLimitRepository.save(record);

        if (
            record.block_status === BlockStatus.TEMPORARY &&
            record.block_expires_at !== null &&
            now < record.block_expires_at
        ) {
            this.throwBlocked(record);
        }
    }


    // * Admin Routes

    async getRateLimitRecords(
        query: RateLimitQueryDto,
        response: Response
    ): Promise<Response> {
        try {
            const { limit = 10, page = 1, identifier, endpoint, blockStatus } = query;

            const baseQuery = this.rateLimitRepository
                .createQueryBuilder('record')
                .orderBy('record.updated_at', 'DESC')
                .select([
                    'record.id',
                    'record.identifier',
                    'record.endpoint',
                    'record.violation_count',
                    'record.window_start_at',
                    'record.requests_in_window',
                    'record.block_status',
                    'record.block_expires_at',
                    'record.violation_count_reset_at',
                    'record.created_at',
                    'record.updated_at',
                ]);

            if (identifier) baseQuery.andWhere('record.identifier = :identifier', { identifier });


            if (endpoint) baseQuery.andWhere('record.endpoint = :endpoint', { endpoint });


            if (blockStatus) baseQuery.andWhere('record.block_status = :blockStatus', { blockStatus });


            const total = await baseQuery.getCount();

            const records = await baseQuery
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            return response.status(HttpStatus.OK).json({
                data: records,
                total,
                page,
                limit,
                statusCode: HttpStatus.OK,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async findById(id: string, response: Response): Promise<Response> {
        try {
            const record = await this.rateLimitRepository.findOne({ where: { id } });
            if (!record) {
                throw new NotFoundException('Rate-limit record not found');
            }
            return response.status(HttpStatus.OK).json({
                data: record,
                statusCode: HttpStatus.OK,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }

    }

    async blockManually(id: string, dto: BlockUserDto, response: Response): Promise<Response> {
        try {
            const now = new Date();
            const { permanent } = dto;

            const record = await this.rateLimitRepository.findOne({ where: { id } });

            if (!record) {
                throw new NotFoundException('Rate-limit record not found');
            }

            record.violation_count += 1;
            record.requests_in_window = 0;
            record.violation_count_reset_at = new Date(now.getTime() + this.RESET_INTERVAL_MS);
            record.block_status = permanent ? BlockStatus.PERMANENT : BlockStatus.TEMPORARY;
            record.block_expires_at = permanent ? null : new Date(now.getTime() + this.MANUAL_BLOCK_DURATION_MS);

            await this.rateLimitRepository.save(record);

            return response.status(HttpStatus.OK).json({
                data: record,
                block_type: permanent ? 'permanent' : 'temporary',
                message: permanent
                    ? 'User has been permanently blocked.'
                    : 'User has been temporarily blocked for 1 day.',
                statusCode: HttpStatus.OK,
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(INTERNAL_SERVER_ERROR_MESSAGE, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unblockManually(id: string, response: Response): Promise<Response> {
        try {
            const record = await this.rateLimitRepository.findOne({ where: { id } });

            if (!record) {
                throw new NotFoundException('Rate-limit record not found');
            }

            record.block_status = BlockStatus.NONE;
            record.block_expires_at = null;
            record.window_start_at = new Date();
            record.requests_in_window = 0;

            await this.rateLimitRepository.save(record);

            return response.status(HttpStatus.OK).json({
                message: 'User has been unblocked.',
                data: record,
                statusCode: HttpStatus.OK,
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(INTERNAL_SERVER_ERROR_MESSAGE, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getStats(response: Response): Promise<Response> {
        try {
            const total = await this.rateLimitRepository.count();
            const blockedTemp = await this.rateLimitRepository.count({
                where: { block_status: BlockStatus.TEMPORARY },
            });
            const blockedPermanent = await this.rateLimitRepository.count({
                where: { block_status: BlockStatus.PERMANENT },
            });

            return response.status(HttpStatus.OK).json({
                total_records: total,
                temporarily_blocked: blockedTemp,
                permanently_blocked: blockedPermanent,
                active_blocked: blockedTemp + blockedPermanent,
                statusCode: HttpStatus.OK,
            });

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async resetById(id: string, response: Response): Promise<Response> {
        try {

            const record = await this.rateLimitRepository.findOne({ where: { id } });

            if (!record) {
                throw new NotFoundException('Rate-limit record not found');
            }

            record.requests_in_window = 0;
            record.violation_count = 0;
            record.violation_count_reset_at = null;
            record.block_status = BlockStatus.NONE;
            record.block_expires_at = null;
            record.window_start_at = new Date();

            await this.rateLimitRepository.save(record);


            return response.status(HttpStatus.OK).json({
                message: `Rate-limit record ${id} has been reset.`,
                statusCode: HttpStatus.OK,
            });

        } catch (error) {
            console.log(error);

            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }



    // * helper

    // Throws a structured exception based on block type.
    private throwBlocked(record: RateLimitRecord): never {

        const is_permanently_blocked = record.block_status === BlockStatus.PERMANENT

        throw new HttpException(
            {
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                error: 'Too Many Requests',
                message: is_permanently_blocked
                    ? 'You are permanently blocked. Contact support.'
                    : 'You are temporarily blocked. Please try again later.',
                block_type: is_permanently_blocked ? 'permanent' : 'temporary',
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }

    // Throws a structured exception based on block type.
    private getBlockDuration(attempts: number): number {
        switch (attempts) {
            case 1: return 10 * 60 * 1000;         // 10 minutes
            case 2: return 60 * 60 * 1000;         // 1 hour
            case 3: return 6 * 60 * 60 * 1000;     // 6 hours
            case 4: return 24 * 60 * 60 * 1000;    // 1 day
            default: return 7 * 24 * 60 * 60 * 1000; // 1 week (won't be used if permanent)
        }
    }
}
