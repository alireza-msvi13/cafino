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
import { PaymentGatewayDto, PaymentVerifyDto } from './dto/payment.dto';
import { Response } from 'express';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PaymentGatewayDoc } from './decorators/swagger.decorators';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';

@Controller('Payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('gateway')
  @UseGuards(JwtGuard)
  @RateLimit({ max: 5, duration: 5 })
  @PaymentGatewayDoc()
  paymentGateway(
    @Body() paymentGatewayDto: PaymentGatewayDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentService.paymentGateway(paymentGatewayDto, userId);
  }

  @Get('verify')
  async paymentVerify(
    @Query() paymentVerifyDto: PaymentVerifyDto,
    @Res() res: Response,
  ) {
    const { Authority, Status } = paymentVerifyDto;
    const result = await this.paymentService.paymentVerify(Authority, Status);
    if (result.success) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment?status=success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment?status=failed`);
    }
  }
}
