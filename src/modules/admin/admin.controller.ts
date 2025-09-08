import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServerResponse } from '../../common/dto/server-response.dto';
import { AdminService } from './admin.service';
import { SalesReportDto } from './dto/admin.dto';

@ApiTags('Admin Overview')
@Controller('admin/overview')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get full admin dashboard overview.' })
  async getOverview() {
    const result = await this.adminService.getOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Dashboard overview fetched successfully.',
      result,
    );
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users overview for dashboard.' })
  async getUserOverview() {
    const result = await this.adminService.getUserOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'User overview fetched successfully.',
      result,
    );
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders overview for dashboard.' })
  async getOrderOverview() {
    const result = await this.adminService.getOrderOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Order overview fetched successfully.',
      result,
    );
  }

  @Get('items')
  @ApiOperation({ summary: 'Get items overview for dashboard.' })
  async getItemOverview() {
    const result = await this.adminService.getItemOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Item overview fetched successfully.',
      result,
    );
  }

  @Get('discounts')
  @ApiOperation({ summary: 'Get discounts overview for dashboard.' })
  async getDiscountOverview() {
    const result = await this.adminService.getDiscountOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Discount overview fetched successfully.',
      result,
    );
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue overview for dashboard.' })
  async getRevenueOverview() {
    const result = await this.adminService.getRevenueOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Revenue overview fetched successfully.',
      result,
    );
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages overview for dashboard.' })
  async getMessageOverview() {
    const result = await this.adminService.getMessageOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Message overview fetched successfully.',
      result,
    );
  }

  @Get('comments')
  @ApiOperation({ summary: 'Get comments overview for dashboard.' })
  async getCommentOverview() {
    const result = await this.adminService.getCommentOverview();
    return new ServerResponse(
      HttpStatus.OK,
      'Comment overview fetched successfully.',
      result,
    );
  }

  @Get('sales-report')
  @ApiOperation({ summary: 'Get sales report by date range' })
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
