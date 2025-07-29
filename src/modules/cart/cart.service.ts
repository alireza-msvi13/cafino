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
import { MultiCartDto } from './dto/multi-cart.dto';

@Injectable()
export class CartService {


    constructor(
        @InjectRepository(CartEntity)
        private cartRepository: Repository<CartEntity>,
        private itemService: ItemService,
        private discountService: DiscountService
    ) { }


    // *primary

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
            if (cartItem) throw new ConflictException("Item is already in your cart");

            await this.itemService.checkItemQuantity(itemId, response, 1)

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

            if (!cartItem) throw new NotFoundException("Item is not exist in your cart");

            let count = cartItem?.count + 1
            await this.itemService.checkItemQuantity(itemId, response, count)

            cartItem.count += 1
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
                    INTERNAL_SERVER_ERROR_MESSAGE,
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

            if (!cartItem) throw new NotFoundException("item is not exist in your cart");

            if (cartItem.count === 1) {
                await this.cartRepository.remove(cartItem);
                return response
                    .status(HttpStatus.OK)
                    .json({
                        message: "Item Removed successfully",
                        statusCode: HttpStatus.OK
                    })
            }

            // await this.itemService.incrementItemQuantity(itemId)
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
                    INTERNAL_SERVER_ERROR_MESSAGE,
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

            if (!cartItem) throw new NotFoundException("item is not exist in your cart");

            await this.cartRepository.remove(cartItem);
            // await this.itemService.incrementItemQuantity(itemId, cartItem.count)

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
                    INTERNAL_SERVER_ERROR_MESSAGE,
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
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async getCart(
        userId: string,
        response: Response
    ): Promise<Response> {
        try {
            const {
                totalAmount,
                totalDiscount,
                paymentAmount,
                cartItems,
                generalDiscount,
            } = await this.getUserCart(userId)

            return response
                .status(HttpStatus.OK)
                .json({
                    totalAmount,
                    totalDiscount,
                    paymentAmount,
                    cartItems,
                    generalDiscount,
                    statusCode: HttpStatus.OK
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

            if (!discount.active) throw new BadRequestException("discount code is not active");

            if (discount.limit && discount.limit <= discount.usage) {
                throw new BadRequestException("discount code expired");
            }

            if (
                discount?.expires_in &&
                discount?.expires_in?.getTime() <= new Date().getTime()
            ) {
                throw new BadRequestException("discount code expired");
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
                    INTERNAL_SERVER_ERROR_MESSAGE,
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
                throw new BadRequestException("discount is not found in your cart");
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
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async addMultipleToCart(
        multiCartDto: MultiCartDto,
        userId: string,
        response: Response
    ): Promise<Response> {
        const items = multiCartDto.items;

        const addedItems: { itemId: string; itemName: string }[] = [];
        const updatedItems: { itemId: string; itemName: string }[] = [];
        const skippedItems: { itemId: string; itemName: string; reason: string }[] = [];

        try {
            for (const { itemId, count } of items) {
                try {
                    const item = await this.itemService.findVisibleItem(itemId);

                    if (!item) {
                        skippedItems.push({ itemId, itemName: 'Unknown', reason: 'Item not exist or hidden' });
                        continue;
                    }

                    const existingItem = await this.cartRepository.findOne({
                        where: {
                            user: { id: userId },
                            item: { id: itemId },
                        },
                    });

                    const totalCount = existingItem ? existingItem.count + count : count;

                    const isAvailable = await this.itemService.hasSufficientStock(itemId, totalCount);
                    if (!isAvailable) {
                        skippedItems.push({ itemId, itemName: item.title, reason: 'Not enough stock' });
                        continue;
                    }


                    if (existingItem) {
                        existingItem.count += count;
                        await this.cartRepository.save(existingItem);
                        updatedItems.push({ itemId, itemName: item.title });
                    } else {
                        const cartItem = this.cartRepository.create({
                            user: { id: userId },
                            item: { id: itemId },
                            count,
                        });
                        await this.cartRepository.save(cartItem);
                        addedItems.push({ itemId, itemName: item.title });
                    }

                } catch (innerError) {
                    skippedItems.push({ itemId, itemName: 'Unknown', reason: 'Unexpected error' });
                }
            }


            await this.cartRepository.update({ user: { id: userId } }, {
                discount: null,
            });

            return response.status(HttpStatus.OK).json({
                message: 'Cart update completed',
                statusCode: HttpStatus.OK,
                addedItems,
                updatedItems,
                skippedItems,
            });

        } catch (error) {
            throw new HttpException(
                'Something went wrong while updating the cart',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // *helper
    async getUserCart(
        userId: string,
    ) {
        try {
            const cart = await this.cartRepository.find({
                relations: { discount: true, item: { category: true, images: true } },
                where: { user: { id: userId } },
            });

            const activeGeneralDiscount = cart.find(item => item.discount?.active);
            let totalAmount = 0;
            let totalDiscount = 0;
            let paymentAmount = 0;

            const cartItems = cart.map(({ item, count }) => {
                const itemTotalPrice = item.price * count;
                const itemDiscount = item.discount > 0 ? itemTotalPrice * (item.discount / 100) : 0;

                totalAmount += itemTotalPrice;
                totalDiscount += itemDiscount;
                paymentAmount += itemTotalPrice - itemDiscount;

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
                        discount.percent > 0 ? paymentAmount * (discount.percent / 100) : discount.amount || 0;

                    paymentAmount = Math.max(paymentAmount - discountAmount, 0);
                    totalDiscount += discountAmount;

                    generalDiscount = {
                        code: discount.code,
                        ...(discount.percent ? { percent: discount.percent } : {}),
                        ...(discount.amount ? { amount: discount.amount } : {}),
                        discountAmount,
                    };
                }
            }

            return {
                totalAmount,
                totalDiscount,
                paymentAmount,
                cartItems,
                generalDiscount,
            }
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
    async clearUserCart(
        userId: string,
    ): Promise<void> {
        try {
            await this.cartRepository
                .createQueryBuilder()
                .delete()
                .where("user_id = :userId", { userId })
                .execute();

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

}
