import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { ItemService } from '../item/item.service';
import { DiscountService } from '../discount/discount.service';
import { ContactService } from '../contact/contact.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { CommentService } from '../comment/comment.service';
import { TicketService } from '../ticket/ticket.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly itemService: ItemService,
    private readonly discountService: DiscountService,
    private readonly contactService: ContactService,
    private readonly commentService: CommentService,
    private readonly ticketService: TicketService,
  ) {}

  // * primary

  async getUserOverview() {
    const [
      usersCount,
      blockedUsersCount,
      newUsersThisWeek,
      newUsersThisMonth,
      monthlyActiveUsers,
    ] = await Promise.all([
      this.userService.countUsers(),
      this.userService.countBlockUsers(),
      this.userService.countUsersRegisteredThisWeek(),
      this.userService.countUsersRegisteredThisMonth(),
      this.orderService.countMonthlyActiveUsers(),
    ]);

    return {
      total: usersCount,
      blockedUsers: blockedUsersCount,
      newUsersThisWeek,
      newUsersThisMonth,
      monthlyActiveUsers,
    };
  }
  async getOrderOverview() {
    const [totalOrders, activeOrders, ordersByStatus, todayOrders] =
      await Promise.all([
        this.orderService.countOrders(),
        this.orderService.countOrdersByStatus([
          OrderStatus.Processing,
          OrderStatus.Delivered,
        ]),
        this.orderService.countOrdersGroupedByStatus(),
        this.orderService.countOrdersByDate(new Date()),
      ]);

    return {
      total: totalOrders,
      active: activeOrders,
      today: todayOrders,
      byStatus: ordersByStatus,
    };
  }
  async getItemOverview() {
    const [itemCount, topSellingItems, lowStockItems] = await Promise.all([
      this.itemService.countActiveItems(),
      this.orderService.getTopSellingItems(5),
      this.itemService.getLowStockItems(10, 5),
    ]);

    return { total: itemCount, lowStockItems, topSellingItems };
  }
  async getDiscountOverview() {
    const [activeDiscounts, expiringDiscounts, topDiscountCodes] =
      await Promise.all([
        this.discountService.countActiveDiscounts(),
        this.discountService.getExpiringDiscounts(),
        this.discountService.getTopDiscountCodes(),
      ]);

    return {
      active: activeDiscounts,
      expiringInWeek: expiringDiscounts,
      topUsed: topDiscountCodes,
    };
  }
  async getRevenueOverview() {
    const [
      totalRevenue,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      averageOrderValue,
    ] = await Promise.all([
      this.orderService.getTotalRevenue(),
      this.orderService.getTodayRevenue(),
      this.orderService.getWeeklyRevenue(),
      this.orderService.getMonthlyRevenue(),
      this.orderService.getAverageOrderValue(),
    ]);

    return {
      total: totalRevenue,
      today: revenueToday,
      thisWeek: revenueThisWeek,
      thisMonth: revenueThisMonth,
      averageOrderValue,
    };
  }
  async getMessageOverview() {
    const [messageCount, unrepliedMessageCount] = await Promise.all([
      this.contactService.countMessages(),
      this.contactService.countUnrepliedMessages(),
    ]);

    return { total: messageCount, unreplied: unrepliedMessageCount };
  }
  async getTicketOverview() {
    const [
      ticketCount,
      openTicketCount,
      closedTicketCount,
      answeredTicketCount,
    ] = await Promise.all([
      this.ticketService.countTickets(),
      this.ticketService.countOpenTickets(),
      this.ticketService.countClosedTickets(),
      this.ticketService.countAnsweredTickets(),
    ]);

    return {
      total: ticketCount,
      open: openTicketCount,
      closed: closedTicketCount,
      answered: answeredTicketCount,
    };
  }
  async getCommentOverview() {
    const [
      totalComments,
      acceptedComments,
      unacceptedComments,
      latestUnacceptedComments,
    ] = await Promise.all([
      this.commentService.countComments(),
      this.commentService.countAcceptedComments(),
      this.commentService.countUnacceptedComments(),
      this.commentService.getlatestUnacceptedComments(),
    ]);

    return {
      total: totalComments,
      accepted: acceptedComments,
      unaccepted: unacceptedComments,
      latestUnacceptedComments,
    };
  }
  async getOverview() {
    const [user, order, item, discount, revenue, message, comment, ticket] =
      await Promise.all([
        this.getUserOverview(),
        this.getOrderOverview(),
        this.getItemOverview(),
        this.getDiscountOverview(),
        this.getRevenueOverview(),
        this.getMessageOverview(),
        this.getCommentOverview(),
        this.getTicketOverview(),
      ]);

    return { user, order, item, discount, revenue, message, comment, ticket };
  }
  async getRevenueByDateRange(startDate?: Date, endDate?: Date) {
    return this.orderService.getRevenueByDateRange(startDate, endDate);
  }
}
