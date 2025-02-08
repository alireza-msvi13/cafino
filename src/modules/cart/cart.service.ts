import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { CartDto } from './dto/cart.dto';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from './entity/cart.entity';
import { Repository } from 'typeorm';
import { ItemService } from '../item/item.service';
import { CartDiscountDto } from './dto/cart-discount.dto';
import { DiscountService } from '../discount/discount.service';

@Injectable()
export class CartService {


    constructor(
        @InjectRepository(CartEntity)
        private cartRepository: Repository<CartEntity>,
        private itemService: ItemService,
        private discountService: DiscountService
    ) { }



    async addToCart(
        cartDto: CartDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const { itemId } = cartDto;
            await this.itemService.checkItemExist(itemId);
            
            let cartItem = await this.cartRepository.findOne({
                where: {
                    user: { id: userId },
                    item: { id: itemId },
                },
            });
            if (cartItem) throw new ConflictException("Item is Already in your Cart");

            await this.itemService.checkItemQuantity(itemId)
            await this.itemService.decrementItemQuantity(itemId)

            cartItem = this.cartRepository.create({
                user: { id: userId },
                item: { id: itemId }
            });
            await this.cartRepository.save(cartItem);

            await this.cartRepository.update({ user: { id: userId } }, {
                discount: null
            })

            return response
                .status(HttpStatus.OK)
                .json({
                    message: 'Item Added To Cart Successfully',
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
    async incrementItem(
        incrementItem: CartDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const { itemId } = incrementItem

            await this.itemService.checkItemExist(itemId);

            let cartItem = await this.cartRepository.findOne({
                where: {
                    user: { id: userId },
                    item: { id: itemId },
                },
            });

            if (!cartItem) throw new NotFoundException("Item is Not Exist in Your Cart");
            else {
                await this.itemService.checkItemQuantity(itemId)
                await this.itemService.decrementItemQuantity(itemId)
                cartItem.count += 1
            }

            await this.cartRepository.save(cartItem);

            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Item Incremented Successfully",
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
    async decrementItem(
        decrementItem: CartDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const { itemId } = decrementItem

            await this.itemService.checkItemExist(itemId);

            let cartItem = await this.cartRepository.findOne({
                where: {
                    user: { id: userId },
                    item: { id: itemId },
                },
            });

            if (!cartItem) throw new NotFoundException("Item is Not Exist in Your Cart");

            if (cartItem.count === 1) {
                await this.cartRepository.remove(cartItem);
                return response
                    .status(HttpStatus.OK)
                    .json({
                        message: "Item Removed successfully",
                        statusCode: HttpStatus.OK
                    })
            }

            await this.itemService.incrementItemQuantity(itemId)
            cartItem.count -= 1
            await this.cartRepository.save(cartItem);

            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Item Decremented Successfully",
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
    async removeFromCart(
        removeItem: CartDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const { itemId } = removeItem

            await this.itemService.checkItemExist(itemId);

            let cartItem = await this.cartRepository.findOne({
                where: {
                    user: { id: userId },
                    item: { id: itemId },
                },
            });

            if (!cartItem) throw new NotFoundException("Item is Not Exist in Your Cart");

            await this.cartRepository.remove(cartItem);
            await this.itemService.incrementItemQuantity(itemId, cartItem.count)

            return response
                .status(HttpStatus.OK)
                .json({
                    message: "Item Removed from your cart successfully",
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    (error.message),
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async deleteCart(
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            await this.cartRepository
                .createQueryBuilder()
                .delete()
                .where("user_id = :userId", { userId })
                .execute();

            return response.status(HttpStatus.OK).json({
                message: "Your Cart Deleted Successfully",
                statusCode: HttpStatus.OK
            });

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
    async getCarts(
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const cart = await this.cartRepository.find({
                relations: { discount: true, item: { category: true, images: true } },
                where: { user: { id: userId } },
            });

            const activeGeneralDiscount = cart.find(item => item.discount?.active);
            let totalAmount = 0;
            let totalDiscount = 0;
            let finalAmount = 0;

            const cartItems = cart.map(({ item, count }) => {
                const itemTotalPrice = item.price * count;
                const itemDiscount = item.discount > 0 ? itemTotalPrice * (item.discount / 100) : 0;

                totalAmount += itemTotalPrice;
                totalDiscount += itemDiscount;
                finalAmount += itemTotalPrice - itemDiscount;

                return {
                    itemId: item.id,
                    title: item.title,
                    description: item.description,
                    count,
                    images: item.images ? item.images.map(image => image.imageUrl) : [],
                    price: item.price,
                    discount: item.discount,
                    finalPrice: itemTotalPrice - itemDiscount,
                    category: item.category ? { title: item.category.title } : null,
                };
            });

            let generalDiscount = {};
            if (activeGeneralDiscount?.discount?.active) {
                const { discount } = activeGeneralDiscount;
                if (discount?.limit && discount.limit > discount.usage) {
                    let discountAmount =
                        discount.percent > 0 ? finalAmount * (discount.percent / 100) : discount.amount || 0;

                    finalAmount = Math.max(finalAmount - discountAmount, 0);
                    totalDiscount += discountAmount;

                    generalDiscount = {
                        code: discount.code,
                        ...(discount.percent ? { percent: discount.percent } : {}),
                        ...(discount.amount ? { amount: discount.amount } : {}),
                        discountAmount,
                    };
                }
            }

            return response
                .status(HttpStatus.OK)
                .json({
                    totalAmount,
                    totalDiscount,
                    finalAmount,
                    cartItems,
                    generalDiscount,
                    statusCode: HttpStatus.OK
                });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    (error.message),
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async addDiscount(
        cartDiscountDto: CartDiscountDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const { code } = cartDiscountDto;
            const discount = await this.discountService.findOneByCode(code);

            const userCartDiscount = await this.cartRepository.findOneBy({
                user: { id: userId },
                discount: { id: discount.id }
            });
            if (userCartDiscount) {
                throw new BadRequestException("Already Used Discount");
            }

            if (!discount.active) throw new BadRequestException("Discount Code is not Active");

            if (discount.limit && discount.limit <= discount.usage) {
                throw new BadRequestException("Discount Code Expired");
            }

            if (
                discount?.expires_in &&
                discount?.expires_in?.getTime() <= new Date().getTime()
            ) {
                throw new BadRequestException("Discount Code Expired");
            }

            await this.cartRepository.update(
                {
                    user: { id: userId },
                },
                {
                    discount: { id: discount.id },
                }
            );

            return response
                .status(HttpStatus.OK)
                .json({
                    message: 'Discount Added Successfully',
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            console.log(error);

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
    async removeDiscount(
        cartDiscountDto: CartDiscountDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const { code } = cartDiscountDto;
            const discount = await this.discountService.findOneByCode(code);

            const userCartDiscount = await this.cartRepository.findOneBy({
                user: { id: userId },
                discount: { id: discount.id }
            });
            if (!userCartDiscount) {
                throw new BadRequestException("Discount is Not Found in your Cart");
            }

            await this.cartRepository.update(
                {
                    user: { id: userId },
                    discount: { id: discount.id }
                },
                {
                    discount: null
                }
            )

            return response
                .status(HttpStatus.OK)
                .json({
                    message: 'Discount Removed Successfully',
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
