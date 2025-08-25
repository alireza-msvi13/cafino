import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DiscountDto } from "./dto/discount.dto";
import { DiscountService } from "./discount.service";
import { JwtGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { UUIDValidationPipe } from "src/common/pipes/uuid-validation.pipe";
import { DiscountQueryDto } from "./dto/sort-discount.dto";
import { UpdateDiscountDto } from "./dto/update-dicount.dto";
import { UpdateActivityStatusDoc } from "src/common/decorators/swagger.decorators";
import { Cron, CronExpression } from '@nestjs/schedule';
@Controller("discount")
@ApiTags('Discount')
@UseGuards(JwtGuard, AdminGuard)
export class DiscountController {
  constructor(private discountService: DiscountService) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDiscountExpiration() {
    await this.discountService.deactivateExpiredDiscounts();
    console.log('Expired discounts deactivated at', new Date());
  }

  @Post()
  @ApiOperation({ summary: "Generate new discount code by admin." })
  generate(@Body() discountDto: DiscountDto) {
    return this.discountService.generate(discountDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all discount code by admin." })
  findAll(@Query() query: DiscountQueryDto) {
    return this.discountService.findAll(query);
  }

  @Put('/:id')
  @UpdateActivityStatusDoc()
  update(
    @Param("id", UUIDValidationPipe) id: string,
    @Body() body: UpdateDiscountDto) {
    return this.discountService.updateActivityStatus(id, body.status);
  }

  @Delete("/:id")
  @ApiOperation({ summary: "Delete discount code by admin." })
  remove(@Param("id", UUIDValidationPipe) id: string) {
    return this.discountService.delete(id);
  }
}
