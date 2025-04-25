import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards
} from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DiscountDto } from "./dto/discount.dto";
import { DiscountService } from "./discount.service";
import { SwaggerContentTypes } from "src/common/enums/swagger.enum";
import { JwtGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Response } from "express";
@Controller("discount")
@ApiTags('Discount')
@UseGuards(JwtGuard, AdminGuard)
export class DiscountController {
  constructor(private discountService: DiscountService) { }

  @Post()
  @ApiOperation({ summary: "generate new discount code by admin" })
  generate(
    @Body() discountDto: DiscountDto,
    @Res() response: Response,
  ) {
    return this.discountService.generate(discountDto, response);
  }

  @Get()
  @ApiOperation({ summary: "get all discount code by admin " })
  findAll(@Res() response: Response) {
    return this.discountService.findAll(response);
  }

  @Delete("/:id")
  @ApiOperation({ summary: " delete discount code by admin" })
  remove(@Param("id",
    new ParseUUIDPipe({
      exceptionFactory: () => new BadRequestException("Invalid Discount Id"),
    })
  ) id: string, @Res() response: Response) {
    return this.discountService.delete(id, response);
  }
}
