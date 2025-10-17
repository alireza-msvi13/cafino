import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { ItemEntity } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { ImageFolder } from 'src/common/enums/image-folder.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, LessThan, Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { UpdateItemDto } from './dto/update-item.dto';
import { isBoolean, toBoolean } from 'src/common/utils/boolean.utils';
import { ItemImageEntity } from './entities/item-image.entity';
import { SortItemDto } from './dto/sort-item.dto';
import { SortByOption } from 'src/modules/item/enum/sort-by-option.enum';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { ServerResponse } from 'src/common/dto/server-response.dto';
import { SearchItemDto } from './dto/search-item.dto';
import { generateSlug } from 'src/common/utils/slug.util';

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
  ) {}

  // *primary

  async createItem(
    createItemDto: CreateItemDto,
    images: MulterFileType[],
  ): Promise<ServerResponse> {
    const {
      title,
      ingredients,
      description,
      price,
      discount,
      quantity,
      show = true,
      category: categoryId,
    } = createItemDto;

    await this.categoryService.checkCategoryVisibility(categoryId);

    const slug = generateSlug(title);

    const item = await this.itemRepository.findOne({
      where: [{ slug }, { title }],
      withDeleted: true,
    });
    if (item)
      throw new ConflictException(
        'Item with this title or slug already exists.',
      );

    let showBoolean = show;
    if (isBoolean(show)) {
      showBoolean = toBoolean(show);
    }

    const newItem = this.itemRepository.create({
      title,
      slug,
      ingredients,
      description,
      price: Number(price),
      discount: Number(discount),
      quantity: Number(quantity),
      category: { id: categoryId },
      show: showBoolean,
    });
    await this.itemRepository.save(newItem);

    if (images.length > 0) {
      await this.storageService.uploadMultiFile(images, ImageFolder.Item);
      const imageEntities = images.map((image) => ({
        image: image.filename,
        imageUrl: this.storageService.getFileLink(
          image.filename,
          ImageFolder.Item,
        ),
        item: { id: newItem.id },
      }));

      await this.itemImageRepository.save(imageEntities);
    }

    return new ServerResponse(HttpStatus.CREATED, 'Item created successfully.');
  }
  async updateItem(
    itemId: string,
    updateItemDto: UpdateItemDto,
    images: MulterFileType[],
  ): Promise<ServerResponse> {
    const {
      title,
      ingredients,
      description,
      price,
      discount,
      quantity,
      show,
      category: categoryId,
    } = updateItemDto;

    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['images'],
    });
    if (!item) throw new NotFoundException('Item not found.');

    const updateObject: DeepPartial<ItemEntity> = {};

    if (categoryId) {
      await this.categoryService.checkCategoryVisibility(categoryId);
      updateObject.category = { id: categoryId };
    }
    if (title) {
      const slug = generateSlug(title);
      const item = await this.itemRepository.findOne({
        where: [{ slug }, { title }],
      });
      if (item)
        throw new ConflictException(
          'Item with this title or slug already exist.',
        );
      updateObject.title = title;
      updateObject.slug = slug;
    }
    if (ingredients) updateObject.ingredients = ingredients;
    if (description) updateObject.description = description;
    if (price) updateObject.price = +price;
    if (discount) updateObject.discount = +discount;
    if (quantity) updateObject.quantity = +quantity;
    if (isBoolean(show)) updateObject.show = toBoolean(show);

    const hasTextDataToUpdate = Object.keys(updateObject).length > 0;
    const hasNewImages = images.length > 0;

    if (!hasTextDataToUpdate && !hasNewImages) {
      return new ServerResponse(HttpStatus.OK, 'No changes were provided.');
    }

    if (images.length > 0) {
      await Promise.all([
        ...item.images.map(async (img) => {
          await this.storageService.deleteFile(img.image, ImageFolder.Item);
          await this.itemImageRepository.delete({ id: img.id });
        }),
      ]);

      await this.storageService.uploadMultiFile(images, ImageFolder.Item);

      const imageEntities = images.map((image) => ({
        image: image.filename,
        imageUrl: this.storageService.getFileLink(
          image.filename,
          ImageFolder.Item,
        ),
        item: { id: itemId },
      }));

      await this.itemImageRepository.save(imageEntities);
    }

    if (hasTextDataToUpdate) {
      await this.itemRepository.update({ id: itemId }, updateObject);
    }

    return new ServerResponse(HttpStatus.OK, 'Item updated successfully.');
  }
  async getAllItems(
    userId: string,
    sortItemDto: SortItemDto,
  ): Promise<ServerResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = SortByOption.Newest,
      minPrice,
      maxPrice,
      category,
      availableOnly,
      search,
    } = sortItemDto;

    const baseQuery = this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.category', 'category')
      .leftJoin('item.images', 'itemImage')
      .where('category.show = :show', { show: true })
      .andWhere('item.show = :show', { show: true });

    if (minPrice !== undefined)
      baseQuery.andWhere('item.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined)
      baseQuery.andWhere('item.price <= :maxPrice', { maxPrice });
    if (availableOnly === true) baseQuery.andWhere('item.quantity > 0');
    if (category)
      baseQuery.andWhere('category.title = :title', { title: category });
    if (search) {
      baseQuery.andWhere(
        '(LOWER(item.title) LIKE :search OR LOWER(item.description) LIKE :search OR LOWER(item.ingredients) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    switch (sortBy) {
      case SortByOption.LowestPrice:
        baseQuery.orderBy('item.price', 'ASC');
        break;
      case SortByOption.HighestPrice:
        baseQuery.orderBy('item.price', 'DESC');
        break;
      case SortByOption.HighestDiscount:
        baseQuery.orderBy('item.discount', 'DESC');
        break;
      case SortByOption.TopRated:
        baseQuery.orderBy('item.rate', 'DESC');
        break;
      case SortByOption.Newest:
      default:
        baseQuery.orderBy('item.created_at', 'DESC');
        break;
    }

    const total = await baseQuery.getCount();

    const items = await baseQuery
      .select([
        'item.id',
        'item.title',
        'item.slug',
        'item.ingredients',
        'item.description',
        'item.price',
        'item.discount',
        'item.quantity',
        'item.rate',
        'item.rate_count',
        'category.title',
        'item.created_at',
        'itemImage.id',
        'itemImage.image',
        'itemImage.imageUrl',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    let favoriteItemIds: string[] = [];
    if (userId) {
      favoriteItemIds = await this.userService.getFavoriteItemIds(userId);
    }

    const dataWithFav = items.map((item) => ({
      ...item,
      isFav: favoriteItemIds.includes(item.id),
    }));

    return new ServerResponse(HttpStatus.OK, 'Items fetched successfully.', {
      total,
      page,
      limit,
      items: dataWithFav,
    });
  }
  async getAllItemsByAdmin(sortItemDto: SortItemDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = SortByOption.Newest,
      minPrice,
      maxPrice,
      search,
      category,
      availableOnly = false,
    } = sortItemDto;

    const baseQuery = this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.category', 'category')
      .leftJoin('item.images', 'itemImage');

    if (minPrice !== undefined)
      baseQuery.andWhere('item.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined)
      baseQuery.andWhere('item.price <= :maxPrice', { maxPrice });
    if (availableOnly === true) baseQuery.andWhere('item.quantity > 0');
    if (category)
      baseQuery.andWhere('category.title = :title', { title: category });
    if (search) {
      baseQuery.andWhere(
        '(LOWER(item.title) LIKE :search OR LOWER(item.description) LIKE :search OR LOWER(item.ingredients) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    switch (sortBy) {
      case SortByOption.LowestPrice:
        baseQuery.orderBy('item.price', 'ASC');
        break;
      case SortByOption.HighestPrice:
        baseQuery.orderBy('item.price', 'DESC');
        break;
      case SortByOption.HighestDiscount:
        baseQuery.orderBy('item.discount', 'DESC');
        break;
      case SortByOption.TopRated:
        baseQuery.orderBy('item.rate', 'DESC');
        break;
      case SortByOption.Newest:
      default:
        baseQuery.orderBy('item.created_at', 'DESC');
        break;
    }

    const total = await baseQuery.getCount();

    const data = await baseQuery
      .select([
        'item.id',
        'item.title',
        'item.slug',
        'item.ingredients',
        'item.description',
        'item.price',
        'item.discount',
        'item.show',
        'item.quantity',
        'item.rate',
        'item.rate_count',
        'category.title',
        'item.created_at',
        'itemImage.id',
        'itemImage.image',
        'itemImage.imageUrl',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new ServerResponse(HttpStatus.OK, 'Items fetched successfully.', {
      total,
      page,
      limit,
      items: data,
    });
  }
  async getItemById(
    id: string,
    userId: string,
    slug?: string,
  ): Promise<ServerResponse> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.category', 'category')
      .leftJoin('item.images', 'itemImage')
      .leftJoin('item.comments', 'comment', 'comment.accept = true')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.children', 'children', 'children.accept = true')
      .leftJoin('children.user', 'childrenUser')
      .select([
        'item.id',
        'item.title',
        'item.slug',
        'item.ingredients',
        'item.description',
        'item.price',
        'item.discount',
        'item.quantity',
        'item.rate',
        'item.rate_count',
        'category.title',
        'itemImage.image',
        'itemImage.imageUrl',
        'comment.id',
        'comment.text',
        'user.first_name',
        'user.last_name',
        'user.username',
        'children.text',
        'childrenUser.first_name',
        'childrenUser.last_name',
        'childrenUser.username',
      ])
      .where('item.id = :id', { id })
      .andWhere('category.show = :show', { show: true })
      .andWhere('item.show = :show', { show: true })
      .getOne();

    if (!item) throw new NotFoundException('Item not found.');

    // if (!slug || slug !== item.slug) {
    //   return new ServerResponse(HttpStatus.MOVED_PERMANENTLY, 'Redirect', {
    //     redirectTo: `${process.env.APP_URL}/menu/item-${item.id}/${item.slug}`,
    //   });
    // }

    const isFav = await this.userService.isItemFavorited(userId, item.id);

    return new ServerResponse(HttpStatus.OK, 'Item fetched successfully.', {
      item: {
        ...item,
        isFav,
      },
    });
  }
  async deleteItemById(itemId: string): Promise<ServerResponse> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'images', 'comments', 'favorites'],
    });
    if (!item) throw new NotFoundException('Item not found.');
    await this.itemRepository.softRemove(item);
    return new ServerResponse(HttpStatus.OK, 'Item deleted successfully.');
  }
  async searchItem(query: SearchItemDto): Promise<ServerResponse> {
    const { page = 1, limit = 10, search = '' } = query;

    const [items, total] = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.images', 'images')
      .where('category.show = :show', { show: true })
      .andWhere('item.show = :show', { show: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where('item.title ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('item.description ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      )
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new ServerResponse(HttpStatus.OK, 'Search done successfully.', {
      total,
      page,
      limit,
      items,
    });
  }

  // *helper

  async checkItemExist(itemId: string): Promise<ItemEntity> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.id = :itemId', { itemId })
      .andWhere('category.show = :show', { show: true })
      .andWhere('item.show = :show', { show: true })
      .getOne();

    if (!item) throw new NotFoundException('Item not found.');
    return item;
  }
  async checkItemQuantity(itemId: string, count: number = 1): Promise<void> {
    if (count < 1) {
      throw new BadRequestException('Invalid quantity requested.');
    }

    const item = await this.checkItemExist(itemId);
    const remainingItem = item?.quantity - count;

    if (remainingItem < 0) {
      throw new UnprocessableEntityException({
        message: {
          error: `Unfortunately, the ${item?.title} stock is less than the quantity you requested.`,
          item: item?.title,
          available_quantity: item?.quantity,
        },
      });
    }
  }
  async incrementItemQuantity(
    itemId: string,
    count: number = 1,
  ): Promise<void> {
    const item = await this.checkItemExist(itemId);
    item.quantity += count;
    await this.itemRepository.update(
      { id: item.id },
      { quantity: item.quantity },
    );
  }
  async decrementItemQuantity(
    itemId: string,
    count: number = 1,
  ): Promise<void> {
    const item = await this.checkItemExist(itemId);
    item.quantity -= count;
    await this.itemRepository.update(
      { id: item.id },
      { quantity: item.quantity },
    );
  }
  async updateItemShowStatusByCategoryId(
    categoryId: string,
    showStatus: boolean,
  ): Promise<void> {
    await this.itemRepository.update(
      { category: { id: categoryId } },
      {
        show: showStatus,
      },
    );
  }
  async decreaseItemsQuantity(orderId: string): Promise<void> {
    const order = await this.orderService.getOrderWithItems(orderId);

    for (const orderItem of order.items) {
      await this.itemRepository.decrement(
        { id: orderItem.item.id },
        'quantity',
        orderItem.count,
      );
    }
  }
  async hasSufficientStock(itemId: string, count: number): Promise<boolean> {
    const item = await this.itemRepository.findOneBy({ id: itemId });
    return item.quantity >= count;
  }
  async findVisibleItem(itemId: string): Promise<ItemEntity | null> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.id = :itemId', { itemId })
      .andWhere('item.show = true')
      .andWhere('category.show = true')
      .getOne();

    return item || null;
  }
  async updateItemRating(
    itemId: string,
    rating: number,
    ratingCount: number,
  ): Promise<void> {
    await this.itemRepository.update(itemId, {
      rate: rating,
      rate_count: ratingCount,
    });
  }
  // * admin dashboard reports

  async countActiveItems() {
    return this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.category', 'category')
      .where('category.show = :show', { show: true })
      .andWhere('item.show = :show', { show: true })
      .getCount();
  }
  async getLowStockItems(threshold: number, limit?: number) {
    return this.itemRepository.find({
      select: ['id', 'title', 'quantity'],
      where: { quantity: LessThan(threshold) },
      order: { quantity: 'ASC' },
      take: limit,
    });
  }
}
