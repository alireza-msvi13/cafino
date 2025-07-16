import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RateLimitService } from "./rate-limit.service";
import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { JwtGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { BlockUserDto, RateLimitQueryDto } from "./dto/rate-limit-query.dto";
import { UUIDValidationPipe } from "src/common/pipes/uuid-validation.pipe";


@Controller('rate-limit')
@UseGuards(JwtGuard, AdminGuard)
@ApiTags('Rate limit')
export class RateLimitController {
    constructor(
        private readonly rateLimitService: RateLimitService
    ) { }

    @Get('records')
    @ApiOperation({ summary: 'Get all rate-limit records' })
    async getRateLimitRecords(
        @Query() rateLimitQueryDto: RateLimitQueryDto,
        @Res() response: Response
    ): Promise<Response> {
        return await this.rateLimitService.getRateLimitRecords(rateLimitQueryDto, response);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific rate-limit record by ID' })
    async findOne(
        @Param('id', UUIDValidationPipe) id: string, @Res() response: Response): Promise<Response> {
        return await this.rateLimitService.findById(id, response);
    }

    @Post('block/:id')
    @UseGuards(JwtGuard, AdminGuard)
    @ApiOperation({
        summary: 'Block user manually - temporary or permanent',
        description: "If permanent set to true, the user will be permanently blocked. Otherwise, the block will be temporary (1 day)."
    })
    async blockUser(
        @Param('id', UUIDValidationPipe) id: string,
        @Body() dto: BlockUserDto,
        @Res() response: Response,
    ) {
        return this.rateLimitService.blockManually(id, dto, response);
    }

    @Post('unblock/:id')
    @UseGuards(JwtGuard, AdminGuard)
    @ApiOperation({
        summary: 'Unblock user manually',
        description: 'This endpoint unblocks a user by ID. It clears only the block status and allows the user to send requests again, but keeps the violation history.',
    })
    async unblockUser(
        @Param('id', UUIDValidationPipe) id: string,
        @Res() response: Response,
    ) {
        return this.rateLimitService.unblockManually(id, response);
    }


    @Post('reset/:id')
    @ApiOperation({
        summary: 'Reset all rate-limit data for a record by ID',
        description: 'This endpoint fully resets the rate-limit record. It clears block status, violation count, and request counters, effectively starting from scratch.',
    })
    reset(
        @Param('id', UUIDValidationPipe) id: string,
        @Res() response: Response
    ) {
        return this.rateLimitService.resetById(id, response);
    }
    

    @Get('stats')
    @ApiOperation({ summary: 'Get global rate-limit stats' })
    stats(
        @Res() response: Response
    ) {
        return this.rateLimitService.getStats(response);
    }

}
