import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { DiscountDto } from "./dto/discount.dto";
import { DiscountService } from "./discount.service";
import { SwaggerContentTypes } from "src/common/enums/swagger.enum";
import { JwtGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Response } from "express";
import { EmptyStringToUndefindInterceptor } from "src/common/interceptors/empty-string-to-undefind.interceptor";

@Controller("discount")
@UseGuards(JwtGuard, AdminGuard)
export class DiscountController {
  constructor(private discountService: DiscountService) { }

  @Post()
  @UseInterceptors(EmptyStringToUndefindInterceptor)
  @ApiOperation({ summary: "generate new discount code" })
  @ApiConsumes(SwaggerContentTypes.FORM_URL_ENCODED, SwaggerContentTypes.JSON)
  generate(
    @Body() discountDto: DiscountDto,
    @Res() response: Response,
  ) {
    return this.discountService.generate(discountDto, response);
  }

  @Get()
  @ApiOperation({ summary: "get all discount code " })
  findAll(@Res() response: Response) {
    return this.discountService.findAll(response);
  }
  @Delete("/:id")
  @ApiOperation({ summary: " delete discount code " })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.discountService.delete(id, response);
  }
}
