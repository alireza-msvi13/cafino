import {
  BadRequestException,
  HttpException,
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
import { INTERNAL_SERVER_ERROR_MESSAGE } from "src/common/constants/error.constant";
import { OrderDto } from "./dto/order.dto";
import { AllowdOrderStatus } from "src/common/constants/order-status.constant";
import { Response } from "express";
import { PaginationDto } from "src/common/dto/pagination.dto";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepository: Repository<OrderItemEntity>,
    private userService: UserService
  ) { }

  async create(cart: OrderDto, userId: string, addressId: string, description: string) {
    try {

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

      if (!orderItems.length) throw new BadRequestException("Your Cart is Empty");

      await this.orderItemRepository.insert(orderItems);

      return order;

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          INTERNAL_SERVER_ERROR_MESSAGE,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
  async findOne(id: string) {
    try {
      const order = await this.orderRepository.findOneBy({ id });
      if (!order) throw new NotFoundException();
      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          INTERNAL_SERVER_ERROR_MESSAGE,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
  async changeOrderStatus(orderId: string, status: string) {
    try {
      if (!AllowdOrderStatus.includes(status)) {
        throw new BadRequestException('Invalid Status')
      }

      await this.orderRepository.update({ id: orderId }, {
        status
      })

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          INTERNAL_SERVER_ERROR_MESSAGE,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
  async changeOrderStatusByAdmin(orderId: string, status: string, response: Response) {
    try {
      await this.changeOrderStatus(orderId, status)

      return response.status(HttpStatus.OK).json({
        message: `Order Status Changed To ${status} Successfully`,
        statusCode: HttpStatus.OK,
      });

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          INTERNAL_SERVER_ERROR_MESSAGE,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async getAllOrders(
    paginationDto: PaginationDto,
    response: Response
  ): Promise<Response> {
    try {
      const { limit = 10, page = 1 } = paginationDto;

      const data = await this.orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.user", "user")
        .leftJoinAndSelect("order.address", "address")
        .leftJoinAndSelect("order.items", "items")
        .leftJoinAndSelect("items.item", "item")
        .leftJoinAndSelect("order.payments", "payments")
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return response.status(HttpStatus.OK).json({
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          INTERNAL_SERVER_ERROR_MESSAGE,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }


}
