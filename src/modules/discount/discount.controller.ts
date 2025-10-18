import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscountDto } from './dto/discount.dto';
import { DiscountService } from './discount.service';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { DiscountQueryDto } from './dto/sort-discount.dto';
import { UpdateDiscountDto } from './dto/update-dicount.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  CreateDiscountDoc,
  DeleteDiscountCodeDoc,
  GetAllDiscountCodesDoc,
  UpdateActivityStatusDoc,
} from './decorators/swagger.decorators';
import { Roles } from 'src/common/enums/role.enum';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller('discount')
@ApiTags('Discount')
@UseGuards(JwtGuard, RolesGuard)
@RolesAllowed(Roles.Admin, Roles.Manager)
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDiscountExpiration() {
    await this.discountService.deactivateExpiredDiscounts();
    console.log('Expired discounts deactivated at', new Date());
  }

  @Post()
  @CreateDiscountDoc()
  generate(@Body() discountDto: DiscountDto) {
    return this.discountService.generate(discountDto);
  }

  @Get()
  @GetAllDiscountCodesDoc()
  findAll(@Query() query: DiscountQueryDto) {
    return this.discountService.findAll(query);
  }

  @Put('/:id')
  @UpdateActivityStatusDoc()
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() body: UpdateDiscountDto,
  ) {
    return this.discountService.updateActivityStatus(id, body.status);
  }

  @Delete('/:id')
  @DeleteDiscountCodeDoc()
  remove(@Param('id', UUIDValidationPipe) id: string) {
    return this.discountService.delete(id);
  }
}
