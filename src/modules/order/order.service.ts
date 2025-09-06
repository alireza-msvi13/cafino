import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entity/order.entity';
import { DeepPartial, In, Repository } from 'typeorm';
import { OrderItemEntity } from './entity/order-items.entity';
import { UserService } from '../user/user.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderDto } from './dto/order.dto';
import { AllowdOrderStatus } from 'src/common/constants/order-status.constant';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { OrderQueryDto } from './dto/sort-order.dto';
import { OrderSortField } from './enum/order.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepository: Repository<OrderItemEntity>,
    private userService: UserService,
  ) {}

  // * primary

  async changeOrderStatusByAdmin(
    orderId: string,
    status: string,
  ): Promise<ServerResponse> {
    await this.changeOrderStatus(orderId, status);
    return new ServerResponse(
      HttpStatus.OK,
      `Order status changed to ${status} successfully.`,
    );
  }
  async getAllOrders(query: OrderQueryDto): Promise<ServerResponse> {
    const { limit = 10, page = 1, sortBy, status } = query;

    const baseQuery = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('order.payments', 'payments')
      .leftJoinAndSelect('order.discount', 'discount')
      .select([
        'order.id',
        'order.payment_amount',
        'order.discount_amount',
        'order.total_amount',
        'order.status',
        'order.description',
        'order.created_at',

        'user.id',
        'user.first_name',
        'user.last_name',
        'user.phone',

        'address.id',
        'address.province',
        'address.city',
        'address.address',

        'items.id',
        'items.count',
        'item.id',
        'item.title',
        'item.price',

        'discount.id',
        'discount.code',
        'discount.percent',
        'discount.amount',

        'payments.id',
        'payments.status',
        'payments.amount',
        'payments.invoice_number',
        'payments.ref_id',
        'payments.created_at',
      ]);

    switch (sortBy) {
      case OrderSortField.Newest:
        baseQuery.orderBy('order.created_at', 'DESC');
        break;
      case OrderSortField.Oldest:
        baseQuery.orderBy('order.created_at', 'ASC');
        break;
      case OrderSortField.TotalAmount:
        baseQuery.orderBy('order.total_amount', 'DESC');
        break;
      default:
        baseQuery.orderBy('order.created_at', 'DESC');
    }

    if (status && AllowdOrderStatus.includes(status)) {
      baseQuery.andWhere('order.status = :status', { status });
    }

    const total = await baseQuery.getCount();

    const orders = await baseQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new ServerResponse(HttpStatus.OK, 'Orders fetched successfully.', {
      total,
      limit,
      page,
      orders,
    });
  }

  // * helper

  async create(
    cart: OrderDto,
    userId: string,
    addressId: string,
    description: string,
  ) {
    await this.userService.findUserByAddress(userId, addressId);

    const {
      cartItems,
      totalAmount,
      paymentAmount,
      totalDiscount,
      generalDiscount,
    } = cart;

    if (!cartItems.length) throw new BadRequestException('Cart is empty.');

    let order = this.orderRepository.create({
      total_amount: totalAmount,
      description,
      discount_amount: totalDiscount,
      payment_amount: paymentAmount,
      status: OrderStatus.PENDING,
      user: { id: userId },
      address: { id: addressId },
      discount: generalDiscount?.id ? { id: generalDiscount.id } : null,
    });

    order = await this.orderRepository.save(order);

    let orderItems: DeepPartial<OrderItemEntity>[] = [];

    for (const cartItem of cartItems) {
      orderItems.push({
        count: cartItem.count,
        item: { id: cartItem.itemId },
        order: { id: order.id },
      });
    }

    await this.orderItemRepository.insert(orderItems);

    return order;
  }
  async findOne(id: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found.');
    return order;
  }
  async changeOrderStatus(orderId: string, status: string) {
    if (!AllowdOrderStatus.includes(status)) {
      throw new BadRequestException('Invalid status.');
    }
    await this.orderRepository.update(
      { id: orderId },
      {
        status,
      },
    );
  }
  async getUserOrders(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    const baseQuery = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('order.payments', 'payments')
      .where('order.user.id = :userId', { userId });

    const total = await baseQuery.getCount();

    const data = await baseQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
    };
  }
  async getOrderWithItems(orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        items: { item: true },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    return order;
  }
  async countUserOrders(userId: string) {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.id = :userId', { userId })
      .getCount();
  }
  async countUserOrdersByStatus(userId: string, statuses: OrderStatus[]) {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('order.status IN (:...statuses)', { statuses })
      .getCount();
  }
  async countOrders() {
    const orders = await this.orderRepository.count();
    return orders;
  }
  async countOrdersByStatus(statuses: OrderStatus[]) {
    return this.orderRepository.count({
      where: { status: In(statuses) },
    });
  }
  async countMonthlyActiveUsers(days = 30): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.user)', 'count')
      .where('order.created_at >= :date', {
        date: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      })
      .getRawOne();

    return Number(result.count) || 0;
  }
  async countOrdersGroupedByStatus(): Promise<Record<OrderStatus, number>> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const counts: Record<OrderStatus, number> = Object.values(
      OrderStatus,
    ).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<OrderStatus, number>,
    );

    result.forEach((row) => {
      counts[row.status as OrderStatus] = Number(row.count);
    });

    return counts;
  }
  async countOrdersByDate(date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();
  }

  async getTopSellingItems(limit: number): Promise<any[]> {
    const items = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.item', 'item')
      .select('item.id', 'id')
      .addSelect('item.title', 'title')
      .addSelect('SUM(orderItem.count)', 'totalSold')
      .groupBy('item.id')
      .addGroupBy('item.title')
      .orderBy('SUM(orderItem.count)', 'DESC')
      .limit(limit)
      .getRawMany();

    return items.map((i) => ({
      ...i,
      totalSold: Number(i.totalSold),
    }));
  }

  // * admin dashboard reports

  async getRevenueByDateRange(
    start?: Date,
    end?: Date,
  ): Promise<RevenueSummary> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'grossSales')
      .addSelect('SUM(order.discount_amount)', 'discounts')
      .addSelect('SUM(order.payment_amount)', 'netRevenue')
      .where('order.status = :status', { status: OrderStatus.DONE });

    if (start && end) {
      query.andWhere('order.created_at BETWEEN :start AND :end', {
        start,
        end,
      });
    } else if (start) {
      query.andWhere('order.created_at >= :start', { start });
    } else if (end) {
      query.andWhere('order.created_at <= :end', { end });
    }

    const result = await query.getRawOne();

    return {
      grossSales: Number(result.grossSales) || 0,
      discounts: Number(result.discounts) || 0,
      netRevenue: Number(result.netRevenue) || 0,
    };
  }

  async getTotalRevenue(): Promise<RevenueSummary> {
    return this.getRevenueByDateRange();
  }

  async getTodayRevenue() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.getRevenueByDateRange(start, end);
  }

  async getWeeklyRevenue(): Promise<RevenueSummary> {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return this.getRevenueByDateRange(start, end);
  }

  async getMonthlyRevenue(): Promise<RevenueSummary> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return this.getRevenueByDateRange(start, end);
  }

  async getAverageOrderValue() {
    const { avg } = await this.orderRepository
      .createQueryBuilder('order')
      .select('AVG(order.total_amount)', 'avg')
      .where('order.status = :status', { status: OrderStatus.DONE })
      .getRawOne();

    return Number(avg) || 0;
  }
}
