import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "./entity/order.entity";
import { DeepPartial, Repository } from "typeorm";
import { OrderItemEntity } from "./entity/order-items.entity";
import { UserService } from "../user/user.service";
import { OrderStatus } from "src/common/enums/order-status.enum";
import { OrderDto } from "./dto/order.dto";
import { AllowdOrderStatus } from "src/common/constants/order-status.constant";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { ServerResponse } from "src/common/dto/server-response.dto";
import { OrderQueryDto } from "./dto/sort-order.dto";
import { OrderSortField } from "./enum/order.enum";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepository: Repository<OrderItemEntity>,
    private userService: UserService
  ) { }


  // * primary

  async changeOrderStatusByAdmin(orderId: string, status: string): Promise<ServerResponse> {
    await this.changeOrderStatus(orderId, status)
    return new ServerResponse(HttpStatus.OK, `Order status changed to ${status} successfully.`);
  }
  async getAllOrders(query: OrderQueryDto): Promise<ServerResponse> {
    const {
      limit = 10,
      page = 1,
      sortBy = OrderSortField.CREATED_AT,
      order = "DESC",
      status,
    } = query;

    const baseQuery = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.address", "address")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.item", "item")
      .leftJoinAndSelect("order.payments", "payments")
      .select([

        "order.id",
        "order.payment_amount",
        "order.discount_amount",
        "order.total_amount",
        "order.status",
        "order.created_at",

        "user.id",
        "user.first_name",
        "user.last_name",
        "user.phone",

        "address.id",
        "address.province",
        "address.city",
        "address.address",

        "items.id",
        "items.count",
        "item.id",
        "item.title",
        "item.price",

        "payments.id",
        "payments.status",
        "payments.amount",
        "payments.invoice_number",
        "payments.ref_id",
        "payments.created_at",
      ]).orderBy(`order.${sortBy}`, order);

    if (status) {
      baseQuery.andWhere("order.status = :status", { status });
    }

    const total = await baseQuery.getCount();

    const orders = await baseQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new ServerResponse(HttpStatus.OK, "Orders fetched successfully.", {
      total,
      limit,
      page,
      orders,
    });
  }

  // * helper

  async create(cart: OrderDto, userId: string, addressId: string, description: string) {


    await this.userService.findUserByAddress(userId, addressId)

    const { cartItems, totalAmount, paymentAmount, totalDiscount } = cart;

    let order = this.orderRepository.create({
      total_amount: totalAmount,
      description,
      discount_amount: totalDiscount,
      payment_amount: paymentAmount,
      status: OrderStatus.Pending,
      user: { id: userId },
      address: { id: addressId }
    });

    order = await this.orderRepository.save(order);


    let orderItems: DeepPartial<OrderItemEntity>[] = [];

    for (const cartItem of cartItems) {
      orderItems.push({
        count: cartItem.count,
        item: { id: cartItem.itemId },
        order: { id: order.id }
      });
    }

    if (!orderItems.length) throw new BadRequestException("Cart is empty.");

    await this.orderItemRepository.insert(orderItems);

    return order;


  }
  async findOne(id: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException("Order not found.");
    return order;
  }
  async changeOrderStatus(orderId: string, status: string) {
    if (!AllowdOrderStatus.includes(status)) {
      throw new BadRequestException('Invalid status.')
    }
    await this.orderRepository.update({ id: orderId }, {
      status
    })
  }
  async getUserOrders(
    userId: string,
    paginationDto: PaginationDto
  ) {
    const { limit = 10, page = 1 } = paginationDto;

    const baseQuery = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.address", "address")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.item", "item")
      .leftJoinAndSelect("order.payments", "payments")
      .where("order.user.id = :userId", { userId });

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
    }
  }
  async getOrderWithItems(orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        items: { item: true },
      },
    });
    if (!order) {
      throw new NotFoundException("Order not found.");
    }
    return order;
  }


}
