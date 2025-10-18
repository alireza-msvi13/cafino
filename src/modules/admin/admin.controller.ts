import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServerResponse } from '../../common/dto/server-response.dto';
import { AdminService } from './admin.service';
import { SalesReportDto } from './dto/admin.dto';
import {
  AdminOverviewDoc,
  FullAdminOverviewDoc,
  SalesReportDoc,
} from './decorators/swagger.decorators';
import { Roles } from 'src/common/enums/role.enum';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Admin Overview')
@Controller('admin/overview')
@UseGuards(JwtGuard, RolesGuard)
@RolesAllowed(Roles.Admin, Roles.Manager)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @FullAdminOverviewDoc()
  async getOverview() {
    const result = await this.adminService.getOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Dashboard overview fetched successfully.',
      result,
    );
  }

  @Get('users')
  @AdminOverviewDoc('Users')
  async getUserOverview() {
    const result = await this.adminService.getUserOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Users overview fetched successfully.',
      result,
    );
  }

  @Get('orders')
  @AdminOverviewDoc('Orders')
  async getOrderOverview() {
    const result = await this.adminService.getOrderOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Orders overview fetched successfully.',
      result,
    );
  }

  @Get('items')
  @AdminOverviewDoc('Items')
  async getItemOverview() {
    const result = await this.adminService.getItemOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Items overview fetched successfully.',
      result,
    );
  }

  @Get('discounts')
  @AdminOverviewDoc('Discounts')
  async getDiscountOverview() {
    const result = await this.adminService.getDiscountOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Discounts overview fetched successfully.',
      result,
    );
  }

  @Get('revenue')
  @AdminOverviewDoc('Revenue')
  async getRevenueOverview() {
    const result = await this.adminService.getRevenueOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Revenue overview fetched successfully.',
      result,
    );
  }

  @Get('messages')
  @AdminOverviewDoc('Messages')
  async getMessageOverview() {
    const result = await this.adminService.getMessageOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Messages overview fetched successfully.',
      result,
    );
  }

  @Get('comments')
  @AdminOverviewDoc('Comments')
  async getCommentOverview() {
    const result = await this.adminService.getCommentOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Comments overview fetched successfully.',
      result,
    );
  }

  @Get('tickets')
  @AdminOverviewDoc('Tickets')
  async getTicketOverview() {
    const result = await this.adminService.getTicketOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Tickets overview fetched successfully.',
      result,
    );
  }

  @Get('sales-report')
  @SalesReportDoc()
  async getSalesReport(@Query() query: SalesReportDto) {
    const startDate = query.start ? new Date(query.start) : undefined;
    const endDate = query.end ? new Date(query.end) : undefined;

    const result = await this.adminService.getRevenueByDateRange(
      startDate,
      endDate,
    );
    return new ServerResponse(
      HttpStatus.OK,
      'Sales report fetched successfully.',
      result,
    );
  }
}
