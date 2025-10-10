import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/payment.dto';
import { Response } from 'express';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PaymentGatewayDoc } from './decorators/swagger.decorators';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';

@Controller('Payment')
@ApiTags('Payment')
@UseGuards(JwtGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('gateway')
  @RateLimit({ max: 5, duration: 5 })
  @PaymentGatewayDoc()
  paymentGateway(
    @Body() paymentDto: PaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentService.paymentGateway(paymentDto, userId);
  }

  @Get('verify')
  async paymentVerify(
    @Query('Authority') authority: string,
    @Query('Status') status: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.paymentVerify(authority, status);
    if (result.success) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment?status=success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment?status=failed`);
    }
  }
}
