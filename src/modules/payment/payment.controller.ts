import { Body, Controller, Get, Post, Query, Res, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentDto } from "./dto/payment.dto";
import { Response } from "express";
import { JwtGuard } from "../auth/guards/access-token.guard";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetUser } from "src/common/decorators/get-user.decorator";

@Controller("Payment")
@ApiTags('Payment')
@UseGuards(JwtGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  @Post("gateway")
  @ApiOperation({ summary: "Payment gateway." })
  paymentGatewat(
    @Body() paymentDto: PaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentService.paymentGatewat(paymentDto, userId);
  }

  @Get("verify")
  @ApiOperation({ summary: "Payment verify." })
  async paymentVerify(
    @Query("Authority") authority: string,
    @Query("Status") status: string,
    @Res() response: Response
  ) {
    return await this.paymentService.paymentVerify(authority, status, response);
  }


}
