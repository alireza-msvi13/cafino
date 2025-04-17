import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { CreateAddressDto } from './dto/create-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';
import { Folder } from 'src/common/enums/folder.enum';
import { ItemService } from '../item/item.service';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { OrderService } from '../order/order.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';


@Injectable()
export class ProfileService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private storageService: StorageService,
        private itemService: ItemService,
        private orderService: OrderService
    ) { }


    // * primary

    async updateUser(
        updateUserDto: UpdateUserDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        try {

            if (updateUserDto.username) {
                await this.userService.checkUsernameExist(
                    updateUserDto.username,
                )
            }
            
            await this.userService.updateUser(updateUserDto, userId)

            return response
                .status(HttpStatus.CREATED)
                .json({
                    message: "User Info Updated Successfully",
                    statusCode: HttpStatus.CREATED
                })
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
    async createAddress(
        userId: string,
        createAddressDto: CreateAddressDto,
        response: Response
    ): Promise<Response> {
        try {
            await this.userService.createAddress(
                userId,
                createAddressDto
            );
            return response
                .status(HttpStatus.CREATED)
                .json({
                    message: "Address Created Successfully",
                    statusCode: HttpStatus.CREATED
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
    async updateAddress(
        addressId: string,
        response: Response,
        updateAddressDto: UpdateAddressDto,
    ): Promise<Response> {
        try {
            await this.userService.checkAddressExist(addressId)
            await this.userService.updateAddress(
                addressId,
                updateAddressDto,
            );
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Address Updated Successfully",
                    statusCode: HttpStatus.OK
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
    async deleteAddress(
        addressId: string,
        response: Response
    ): Promise<Response> {
        try {
            await this.userService.checkAddressExist(addressId)
            await this.userService.deleteAddress(addressId);
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Address Deleted Successfully",
                    statusCode: HttpStatus.OK
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
    async getAddresses(
        userId: string,
        response: Response
    ): Promise<Response> {
        try {

            const addresses = await this.userService.getAddresses(userId)

            return response
                .status(HttpStatus.OK)
                .json({
                    data: addresses,
                    statusCode: HttpStatus.OK
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
    async updateImage(
        userId: string,
        image: Express.Multer.File,
        response: Response
    ): Promise<Response> {
        try {
            const imageUrl = this.storageService.getFileLink(
                image.filename,
                Folder.ProfileImage
            )
            const storageQuery = this.storageService.uploadSingleFile(
                image.filename,
                image.buffer,
                Folder.ProfileImage
            )
            const userQuery = this.userService.updateImage(
                userId,
                image.filename,
                imageUrl
            )
            await Promise.all([
                storageQuery,
                userQuery
            ])
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Profile Image Updated",
                    statusCode: HttpStatus.OK
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
    async deleteImage(
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const {
                image
            } = await this.userService.findUserById(
                userId
            );
            if (!image) throw new BadRequestException("user dosnt have image profile")

            const storageQuery = this.storageService.deleteFile(
                image,
                Folder.ProfileImage
            )
            const userQuery = this.userService.deleteImage(
                userId
            )
            await Promise.all([
                storageQuery,
                userQuery
            ])
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "User Profile Image Deleted",
                    statusCode: HttpStatus.OK
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
    async addToFavorite(
        userId: string,
        itemId: string,
        response: Response
    ): Promise<Response> {
        try {
            await this.itemService.checkItemExist(itemId)
            await this.userService.addToFavorite(userId, itemId);
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Item Added to Favorites",
                    statusCode: HttpStatus.OK
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
    async removeFromFavorite(
        userId: string,
        itemId: string,
        response: Response
    ): Promise<Response> {
        try {
            await this.userService.removeFromFavorite(
                userId,
                itemId
            );
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Item Deleted from Favorites",
                    statusCode: HttpStatus.OK
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
    async findUserFavorites(userId: string, response: Response) {
        try {
            const data = await this.userService.findUserFavorites(userId)
            return response
                .status(HttpStatus.OK)
                .json({
                    data,
                    statusCode: HttpStatus.OK
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
    async cancelOrder(
        orderId: string,
        response: Response
    ): Promise<Response> {
        try {
            await this.orderService.changeOrderStatus(
                orderId,
                OrderStatus.Canceled
            )
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Order Cancel Successfully",
                    statusCode: HttpStatus.OK
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
    async getUserOrders(
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const userOrders = await this.orderService.getUserOrders(
                userId,
            )
            return response
                .status(HttpStatus.OK)
                .json({
                    data: userOrders,
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    (error),
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

}
