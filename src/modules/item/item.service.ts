import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from '../storage/storage.service';
import { ItemEntity } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { Folder } from 'src/common/enums/folder.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial,Repository } from 'typeorm';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { CategoryService } from '../category/category.service';
import { UpdateItemDto } from './dto/update-item.dto';
import { isBoolean, toBoolean } from 'src/common/utils/boolean.utils';
import { ItemImageEntity } from './entities/item-image.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SortItemDto } from './dto/sort-item.dto';
import { SortByOption } from 'src/common/enums/sort-by-option.enum';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';


@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemEntity)
    private itemRepository: Repository<ItemEntity>,
    @InjectRepository(ItemImageEntity)
    private itemImageRepository: Repository<ItemImageEntity>,
    private storageService: StorageService,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private orderService: OrderService,

  ) { }

  // *primary

  async createItem(
    createItemDto: CreateItemDto,
    images: MulterFileType[],
    response: Response
  ): Promise<Response> {
    const {
      title,
      ingredients,
      description,
      price,
      discount,
      quantity,
      show,
      category: categoryId,
    } = createItemDto;

    try {
      await this.categoryService.findOneById(categoryId);

      let showBoolean = show;
      if (isBoolean(show)) {
        showBoolean = toBoolean(show);
      }

      const newItem = this.itemRepository.create({
        title,
        ingredients,
        description,
        price: Number(price),
        discount: Number(discount),
        quantity: Number(quantity),
        category: { id: categoryId },
        show: showBoolean
      });
      await this.itemRepository.save(newItem);

      if (images.length > 0) {
        await this.storageService.uploadMultiFile(images, Folder.Item)
        const imageEntities = images.map(image => ({
          image: image.filename,
          imageUrl: this.storageService.getFileLink(image.filename, Folder.Item),
          item: { id: newItem.id },
        }));

        await this.itemImageRepository.save(imageEntities);
      }

      return response.status(HttpStatus.CREATED).json({
        message: "Item Created Successfully",
        statusCode: HttpStatus.CREATED,
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

  async updateItem(
    itemId: string,
    updateItemDto: UpdateItemDto,
    images: MulterFileType[],
    response: Response
  ): Promise<Response> {
    try {

      const {
        title,
        ingredients,
        description,
        price,
        discount,
        quantity,
        show,
        category: categoryId
      } = updateItemDto;

      const item = await this.itemRepository.findOne({
        where: { id: itemId },
        relations: ["images"],
      });
      if (!item) throw new NotFoundException("item not found");

      const updateObject: DeepPartial<ItemEntity> = {};

      if (categoryId) {
        await this.categoryService.findOneById(categoryId);
        updateObject.category = { id: categoryId };
      }
      if (title) updateObject.title = title;
      if (ingredients) updateObject.ingredients = ingredients;
      if (description) updateObject.description = description;
      if (price) updateObject.price = +price;
      if (discount) updateObject.discount = +discount;
      if (quantity) updateObject.quantity = +quantity
      if (show && isBoolean(show)) updateObject.show = toBoolean(show);


      if (images.length > 0) {
        await Promise.all([
          item.images.map(async (img) => {
            await this.storageService.deleteFile(img.image, Folder.Item);
            await this.itemImageRepository.delete({ id: img.id });
          }),
          this.storageService.uploadMultiFile(images, Folder.Item)
        ]);

        const imageEntities = images.map(image => ({
          image: image.filename,
          imageUrl: this.storageService.getFileLink(image.filename, Folder.Item),
          item: { id: itemId },
        }));

        await Promise.all([
          this.itemImageRepository.save(imageEntities),
          this.itemRepository.update({ id: itemId }, updateObject)
        ])

      } else {
        await this.itemRepository.update({ id: itemId }, updateObject);
      }


      return response
        .status(HttpStatus.OK)
        .json({
          message: "Item Updated Successfully",
          statusCode: HttpStatus.OK
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

  async getAllItems(
    response: Response,
    userId: string,
    sortItemDto: SortItemDto
  ): Promise<Response> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = SortByOption.Newest,
        minPrice,
        maxPrice,
        categoryId,
        availableOnly = false,
        search
      } = sortItemDto;

      const baseQuery = this.itemRepository
        .createQueryBuilder("item")
        .leftJoin("item.category", "category")
        .leftJoin("item.images", "itemImage")
        .where("category.show = :show", { show: true })
        .andWhere("item.show = :show", { show: true });


      if (minPrice !== undefined) baseQuery.andWhere("item.price >= :minPrice", { minPrice });
      if (maxPrice !== undefined) baseQuery.andWhere("item.price <= :maxPrice", { maxPrice });
      if (availableOnly === true) baseQuery.andWhere("item.quantity > 0");
      if (categoryId) baseQuery.andWhere("category.id = :categoryId", { categoryId });
      if (search) {
        baseQuery.andWhere(
          "(LOWER(item.title) LIKE :search OR LOWER(item.description) LIKE :search OR LOWER(item.ingredients) LIKE :search)",
          { search: `%${search.toLowerCase()}%` }
        );
      }


      switch (sortBy) {
        case SortByOption.LowestPrice:
          baseQuery.orderBy("item.price", "ASC");
          break;
        case SortByOption.HighestPrice:
          baseQuery.orderBy("item.price", "DESC");
          break;
        case SortByOption.HighestDiscount:
          baseQuery.orderBy("item.discount", "DESC");
          break;
        case SortByOption.TopRated:
          baseQuery.orderBy("item.rate", "DESC");
          break;
        case SortByOption.Newest:
        default:
          baseQuery.orderBy("item.createdAt", "DESC");
          break;
      }

      const total = await baseQuery.getCount();

      const items = await baseQuery
        .select([
          "item.id",
          "item.title",
          "item.ingredients",
          "item.description",
          "item.price",
          "item.discount",
          "item.quantity",
          "item.rate",
          "item.rate_count",
          "category.title",
          "item.createdAt",
          "itemImage.image",
          "itemImage.imageUrl",
        ])
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      let favoriteItemIds: string[] = [];
      if (userId) {
        favoriteItemIds = await this.userService.getFavoriteItemIds(userId);
      }

      const dataWithFav = items.map(item => ({
        ...item,
        isFav: favoriteItemIds.includes(item.id)
      }));

      return response.status(HttpStatus.OK).json({
        data: dataWithFav,
        total,
        page,
        limit,
        statusCode: HttpStatus.OK
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

  async getAllItemsByAdmin(sortItemDto: SortItemDto, response: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = SortByOption.Newest,
        minPrice,
        maxPrice,
        availableOnly = false
      } = sortItemDto;

      const baseQuery = this.itemRepository
        .createQueryBuilder("item")
        .leftJoin("item.category", "category")
        .leftJoin("item.images", "itemImage")


      if (minPrice !== undefined) baseQuery.andWhere("item.price >= :minPrice", { minPrice });
      if (maxPrice !== undefined) baseQuery.andWhere("item.price <= :maxPrice", { maxPrice });
      if (availableOnly === true) baseQuery.andWhere("item.quantity > 0");



      switch (sortBy) {
        case SortByOption.LowestPrice:
          baseQuery.orderBy("item.price", "ASC");
          break;
        case SortByOption.HighestPrice:
          baseQuery.orderBy("item.price", "DESC");
          break;
        case SortByOption.HighestDiscount:
          baseQuery.orderBy("item.discount", "DESC");
          break;
        case SortByOption.TopRated:
          baseQuery.orderBy("item.rate", "DESC");
          break;
        case SortByOption.Newest:
        default:
          baseQuery.orderBy("item.createdAt", "DESC");
          break;
      }


      const total = await baseQuery.getCount();


      const data = await baseQuery
        .select([
          "item.id",
          "item.title",
          "item.ingredients",
          "item.description",
          "item.price",
          "item.discount",
          "item.quantity",
          "item.rate",
          "item.rate_count",
          "category.title",
          "item.createdAt",
          "itemImage.image",
          "itemImage.imageUrl",
        ])
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return response.status(HttpStatus.OK).json({
        data,
        total,
        page,
        limit,
        statusCode: HttpStatus.OK
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

  async getItemById(itemId: string, userId: string, response: Response): Promise<Response> {
    try {
      const item = await this.itemRepository
        .createQueryBuilder("item")
        .leftJoin("item.category", "category")
        .leftJoin("item.images", "itemImage")
        .leftJoin("item.comments", "comment", "comment.accept = true")
        .leftJoin("comment.user", "user")
        .leftJoin("comment.children", "children", "children.accept = true")
        .leftJoin("children.user", "childrenUser")
        .select([
          "item.id",
          "item.title",
          "item.ingredients",
          "item.description",
          "item.price",
          "item.discount",
          "item.quantity",
          "item.rate",
          "item.rate_count",
          "category.title",
          "itemImage.image",
          "itemImage.imageUrl",
          "comment.id",
          "comment.text",
          "user.first_name",
          "user.last_name",
          "user.username",
          "children.text",
          "childrenUser.first_name",
          "childrenUser.last_name",
          "childrenUser.username"
        ])
        .where("item.id = :itemId", { itemId })
        .andWhere("category.show = :show", { show: true })
        .andWhere("item.show = :show", { show: true })
        .getOne();

      if (!item) throw new NotFoundException("item not found");

      const isFav = await this.userService.isItemFavorited(userId, itemId);



      return response.status(HttpStatus.OK).json({
        data: {
          ...item,
          isFav
        },
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

  async deleteItemById(
    itemId: string,
    response: Response
  ): Promise<Response> {
    try {
      const deleteResult = await this.itemRepository.delete({ id: itemId });

      if (deleteResult.affected === 0) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({
            message: "item not found",
            statusCode: HttpStatus.NOT_FOUND
          });
      }
      return response
        .status(HttpStatus.OK)
        .json({
          message: "Item Delete Successfully",
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

  async searchItem(searchQuery: string, response: Response) {
    try {
      const items = await this.itemRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.category', 'category')
        .leftJoinAndSelect('item.images', 'images')
        .where("category.show = :show", { show: true })
        .andWhere("item.show = :show", { show: true })
        .andWhere('item.title ILIKE :search', { search: `%${searchQuery}%` })
        .orWhere('item.description ILIKE :search', { search: `%${searchQuery}%` })
        .getMany();

      if (!items.length) {
        throw new NotFoundException()
      }

      return response.status(HttpStatus.OK).json({
        data: items,
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

  // *helper

  async checkItemExist(itemId: string): Promise<ItemEntity> {
    try {
      const item = await this.itemRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.category', 'category')
        .where('item.id = :itemId', { itemId })
        .andWhere('category.show = :show', { show: true })
        .andWhere('item.show = :show', { show: true })
        .getOne();

      if (!item) throw new NotFoundException('Item Not Found');
      return item
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
  async checkItemQuantity(
    itemId: string,
    count: number = 1,
    title?: string,
    response?: Response
  ): Promise<void> {
    try {
      const item = await this.checkItemExist(itemId)

      const remainingItem = item?.quantity - count;

      if (remainingItem < 0) {
        if (title) {
          throw response
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .json({
              message: `unfortunately, the ${title} stock is less than the quantity you requested`,
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              item: title,
              available_qunatity: item?.quantity
            })
        }
        throw new HttpException(
          "unfortunately, the item stock is less than the quantity you requested",
          HttpStatus.UNPROCESSABLE_ENTITY
        )
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
  async incrementItemQuantity(
    itemId: string,
    count: number = 1
  ): Promise<void> {
    try {
      const item = await this.checkItemExist(itemId)

      item.quantity += count

      await this.itemRepository.update({ id: item.id }, { quantity: item.quantity })

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
  async decrementItemQuantity(
    itemId: string,
    count: number = 1
  ): Promise<void> {
    try {
      const item = await this.checkItemExist(itemId)

      item.quantity -= count

      await this.itemRepository.update({ id: item.id }, { quantity: item.quantity })

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
  async updateItemShowStatusByCategoryId(categoryId: string, showStatus: boolean): Promise<void> {
    try {
      await this.itemRepository.update({ category: { id: categoryId } }, {
        show: showStatus
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
  async decreaseItemsQuantity(orderId: string): Promise<void> {
    const order = await this.orderService.getOrderWithItems(orderId);

    console.log(order);


    for (const orderItem of order.items) {
      await this.itemRepository.decrement(
        { id: orderItem.item.id },
        "quantity",
        orderItem.count
      );
    }
  }

  async hasSufficientStock(itemId: string, count: number): Promise<boolean> {
    try {
      const item = await this.itemRepository.findOneBy({ id: itemId });
      return item.quantity >= count;
    } catch (error) {
      return false
    }
  }
  async findVisibleItem(itemId: string): Promise<ItemEntity | null> {
    try {
      const item = await this.itemRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.category', 'category')
        .where('item.id = :itemId', { itemId })
        .andWhere('item.show = true')
        .andWhere('category.show = true')
        .getOne();

      return item || null;
    } catch (error) {
      return null;
    }
  }

  async updateItemRating(itemId: string, rating: number, ratingCount: number): Promise<void> {
    try {
      await this.itemRepository.update(itemId, {
        rate: rating,
        rate_count: ratingCount,
      });
    } catch (error) {
      throw new HttpException(
        INTERNAL_SERVER_ERROR_MESSAGE,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }





}
