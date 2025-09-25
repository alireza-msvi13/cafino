import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { CreateAddressDto } from './dto/create-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';
import { ImageFolder } from 'src/common/enums/image-folder.enum';
import { ItemService } from '../item/item.service';
import { OrderService } from '../order/order.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { TicketService } from '../ticket/ticket.service';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private storageService: StorageService,
    private itemService: ItemService,
    private orderService: OrderService,
    private ticketService: TicketService,
  ) {}

  // * primary

  async updateUser(
    updateUserDto: UpdateUserDto,
    userId: string,
  ): Promise<ServerResponse> {
    // if (updateUserDto.username) {
    //   await this.userService.checkUsernameExist(updateUserDto.username);
    // }

    await this.userService.updateUser(updateUserDto, userId);

    return new ServerResponse(HttpStatus.OK, 'User info updated successfully.');
  }
  async createAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<ServerResponse> {
    await this.userService.createAddress(userId, createAddressDto);
    return new ServerResponse(
      HttpStatus.CREATED,
      'Address created successfully.',
    );
  }
  async updateAddress(
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<ServerResponse> {
    await this.userService.checkAddressExist(addressId);
    await this.userService.updateAddress(addressId, updateAddressDto);

    return new ServerResponse(HttpStatus.OK, 'Address updated successfully.');
  }
  async deleteAddress(addressId: string): Promise<ServerResponse> {
    await this.userService.checkAddressExist(addressId);
    await this.userService.deleteAddress(addressId);
    return new ServerResponse(HttpStatus.OK, 'Address deleted successfully.');
  }
  async getAddresses(userId: string): Promise<ServerResponse> {
    const addresses = await this.userService.getAddresses(userId);
    return new ServerResponse(
      HttpStatus.OK,
      'User addresses fetched successfully.',
      { addresses },
    );
  }
  async updateImage(
    userId: string,
    image: Express.Multer.File,
  ): Promise<ServerResponse> {
    const imageUrl = this.storageService.getFileLink(
      image.filename,
      ImageFolder.ProfileImage,
    );
    const storageQuery = this.storageService.uploadSingleFile(
      image.filename,
      image.buffer,
      ImageFolder.ProfileImage,
    );
    const userQuery = this.userService.updateImage(
      userId,
      image.filename,
      imageUrl,
    );
    await Promise.all([storageQuery, userQuery]);

    return new ServerResponse(
      HttpStatus.OK,
      'Profile image updated successfully.',
    );
  }
  async deleteImage(userId: string): Promise<ServerResponse> {
    const { image } = await this.userService.findUserById(userId);
    if (!image) throw new BadRequestException('User dosnt have image profile.');

    const storageQuery = this.storageService.deleteFile(
      image,
      ImageFolder.ProfileImage,
    );
    const userQuery = this.userService.deleteImage(userId);
    await Promise.all([storageQuery, userQuery]);

    return new ServerResponse(
      HttpStatus.OK,
      'User profile image deleted successfully.',
    );
  }
  async addToFavorite(userId: string, itemId: string): Promise<ServerResponse> {
    await this.itemService.checkItemExist(itemId);
    await this.userService.addToFavorite(userId, itemId);
    return new ServerResponse(
      HttpStatus.OK,
      'Item added to favorites successfully.',
    );
  }
  async removeFromFavorite(
    userId: string,
    itemId: string,
  ): Promise<ServerResponse> {
    await this.userService.removeFromFavorite(userId, itemId);
    return new ServerResponse(
      HttpStatus.OK,
      'Item deleted from favorites successfully.',
    );
  }
  async findUserFavorites(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<ServerResponse> {
    const { data, total, page, limit } =
      await this.userService.findUserFavorites(userId, paginationDto);

    return new ServerResponse(
      HttpStatus.OK,
      'Item deleted from favorites successfully.',
      {
        total,
        page,
        limit,
        items: data,
      },
    );
  }
  async cancelOrder(orderId: string): Promise<ServerResponse> {
    await this.orderService.changeOrderStatus(orderId, OrderStatus.Canceled);

    return new ServerResponse(HttpStatus.OK, 'Order canceled successfully.');
  }
  async getUserOrders(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<ServerResponse> {
    const { data, total, page, limit } = await this.orderService.getUserOrders(
      userId,
      paginationDto,
    );

    return new ServerResponse(HttpStatus.OK, 'Orders fetched successfully.', {
      total,
      page,
      limit,
      orders: data,
    });
  }
  async getOverview(userId: string): Promise<ServerResponse> {
    const favoritesCount = await this.userService.countUserFavorites(userId);
    const addressCount = await this.userService.countUserAddresses(userId);
    const totalOrdersCount = await this.orderService.countUserOrders(userId);
    const activeOrdersCount = await this.orderService.countUserOrdersByStatus(
      userId,
      [OrderStatus.Processing, OrderStatus.Delivered],
    );
    const ticketCount = await this.ticketService.countUserTickets(userId);
    const openTicketCount =
      await this.ticketService.countUserOpenTickets(userId);

    return new ServerResponse(
      HttpStatus.OK,
      'User overview fetched successfully.',
      {
        address: {
          total: addressCount,
        },
        favorite: {
          total: favoritesCount,
        },
        order: {
          total: totalOrdersCount,
          active: activeOrdersCount,
        },
        ticket: {
          total: ticketCount,
          open: openTicketCount,
        },
      },
    );
  }
}
