import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from './entity/cart.entity';
import { Repository } from 'typeorm';
import { ItemService } from '../item/item.service';
import { CartDiscountDto } from './dto/cart-discount.dto';
import { DiscountService } from '../discount/discount.service';
import { MultiCartDto } from './dto/multi-cart.dto';
import { ServerResponse } from 'src/common/dto/server-response.dto';

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
    ): Promise<ServerResponse> {
        const { itemId } = cartDto;
        await this.itemService.checkItemExist(itemId);

        let cartItem = await this.cartRepository.findOne({
            where: {
                user: { id: userId },
                item: { id: itemId },
            },
        });
        if (cartItem) throw new ConflictException("Item is already in your cart.");

        await this.itemService.checkItemQuantity(itemId, 1)

        cartItem = this.cartRepository.create({
            user: { id: userId },
            item: { id: itemId }
        });
        await this.cartRepository.save(cartItem);

        await this.cartRepository.update({ user: { id: userId } }, {
            discount: null
        })

        return new ServerResponse(HttpStatus.OK, 'Item Added To Cart Successfully.');
    }
    async incrementItem(
        incrementItem: CartDto,
        userId: string,
    ): Promise<ServerResponse> {

        const { itemId } = incrementItem;

        await this.itemService.checkItemExist(itemId);

        let cartItem = await this.cartRepository.findOne({
            where: {
                user: { id: userId },
                item: { id: itemId },
            },
        });

        if (!cartItem) {
            throw new NotFoundException("Item is not exist in your cart.");
        }

        let count = cartItem.count + 1;
        await this.itemService.checkItemQuantity(itemId, count);

        cartItem.count += 1;
        await this.cartRepository.save(cartItem);

        return new ServerResponse(HttpStatus.OK, "Item Incremented Successfully.");
    }
    async decrementItem(
        decrementItem: CartDto,
        userId: string,
    ): Promise<ServerResponse> {

        const { itemId } = decrementItem

        await this.itemService.checkItemExist(itemId);

        let cartItem = await this.cartRepository.findOne({
            where: {
                user: { id: userId },
                item: { id: itemId },
            },
        });

        if (!cartItem) throw new NotFoundException("Item is not exist in your cart.");

        if (cartItem.count === 1) {
            await this.cartRepository.remove(cartItem);

            return new ServerResponse(HttpStatus.OK, "Item Removed successfully.");

        }

        // await this.itemService.incrementItemQuantity(itemId)
        cartItem.count -= 1
        await this.cartRepository.save(cartItem);

        return new ServerResponse(HttpStatus.OK, "Item Decremented Successfully.");

    }
    async removeFromCart(
        removeItem: CartDto,
        userId: string,
    ): Promise<ServerResponse> {

        const { itemId } = removeItem

        await this.itemService.checkItemExist(itemId);

        let cartItem = await this.cartRepository.findOne({
            where: {
                user: { id: userId },
                item: { id: itemId },
            },
        });

        if (!cartItem) throw new NotFoundException("Item is not exist in your cart.");

        await this.cartRepository.remove(cartItem);

        return new ServerResponse(HttpStatus.OK, "Item Removed from your cart successfully.");

    }
    async deleteCart(
        userId: string
    ): Promise<ServerResponse> {

        await this.cartRepository
            .createQueryBuilder()
            .delete()
            .where("user_id = :userId", { userId })
            .execute();

        return new ServerResponse(HttpStatus.OK, "Your Cart Deleted Successfully.");

    }
    async getCart(
        userId: string,
    ): Promise<ServerResponse> {

        const {
            totalAmount,
            totalDiscount,
            paymentAmount,
            cartItems,
            generalDiscount,
        } = await this.getUserCart(userId)


        return new ServerResponse(HttpStatus.OK, 'Cart fetched successfully.', {
            totalAmount,
            totalDiscount,
            paymentAmount,
            cartItems,
            generalDiscount,
        })
    }
    async addDiscount(
        cartDiscountDto: CartDiscountDto,
        userId: string
    ): Promise<ServerResponse> {

        const { code } = cartDiscountDto;
        const discount = await this.discountService.findOneByCode(code);

        const userCartDiscount = await this.cartRepository.findOneBy({
            user: { id: userId },
            discount: { id: discount.id }
        });
        if (userCartDiscount) {
            throw new BadRequestException("Already Used Discount.");
        }

        if (!discount.active) throw new BadRequestException("Discount code expired.");

        if (discount.limit && discount.limit <= discount.usage) {
            throw new BadRequestException("Discount code expired.");
        }

        if (
            discount?.expires_in &&
            discount?.expires_in?.getTime() <= new Date().getTime()
        ) {
            throw new BadRequestException("Discount code expired.");
        }

        await this.cartRepository.update(
            {
                user: { id: userId },
            },
            {
                discount: { id: discount.id },
            }
        );

        return new ServerResponse(HttpStatus.OK, "Discount Added Successfully.");
    }
    async removeDiscount(
        cartDiscountDto: CartDiscountDto,
        userId: string,
    ): Promise<ServerResponse> {

        const { code } = cartDiscountDto;
        const discount = await this.discountService.findOneByCode(code);

        const userCartDiscount = await this.cartRepository.findOneBy({
            user: { id: userId },
            discount: { id: discount.id }
        });
        if (!userCartDiscount) {
            throw new BadRequestException("Discount is not found in your cart.");
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

        return new ServerResponse(HttpStatus.OK, "Discount Removed Successfully.");
    }
    async addMultipleToCart(
        multiCartDto: MultiCartDto,
        userId: string,
    ): Promise<ServerResponse> {
        const items = multiCartDto.items;

        const addedItems: { itemId: string; itemName: string }[] = [];
        const updatedItems: { itemId: string; itemName: string }[] = [];
        const skippedItems: { itemId: string; itemName: string; reason: string }[] = [];


        for (const { itemId, count } of items) {
            try {
                const item = await this.itemService.findVisibleItem(itemId);

                if (!item) {
                    skippedItems.push({ itemId, itemName: 'Unknown', reason: 'Item not exist or hidden.' });
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
                    skippedItems.push({ itemId, itemName: item.title, reason: 'Not enough stock.' });
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
                skippedItems.push({ itemId, itemName: 'Unknown', reason: 'Unexpected error.' });
            }
        }


        await this.cartRepository.update({ user: { id: userId } }, {
            discount: null,
        });


        return new ServerResponse(HttpStatus.OK, 'Cart update completed.', {
            addedItems,
            updatedItems,
            skippedItems,
        });

    }


    // *helper
    async getUserCart(
        userId: string,
    ) {

        const cart = await this.cartRepository.find({
            relations: { discount: true, item: { category: true, images: true } },
            where: { user: { id: userId } },
        });

        const activeGeneralDiscount = cart.find(item => item.discount?.active);
        let totalAmount = 0;
        let totalDiscount = 0;
        let paymentAmount = 0;

        const cartItems = cart.map(({ item, count }) => {
            const itemTotalPrice = Math.round(item.price * count);
            const itemDiscount = Math.round(item.discount > 0 ? itemTotalPrice * (item.discount / 100) : 0);

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
                    id: discount.id,
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

    }
    async clearUserCart(
        userId: string,
    ): Promise<void> {
        await this.cartRepository
            .createQueryBuilder()
            .delete()
            .where("user_id = :userId", { userId })
            .execute();
    }

}
