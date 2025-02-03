import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Response } from 'express';
// import { UserService } from '../user/user.service';
import { StorageService } from '../storage/storage.service';
import { ItemEntity } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { Folder } from 'src/common/enums/folder.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { CategoryService } from '../category/category.service';
import { UpdateItemDto } from './dto/update-item.dto';
import { toBoolean } from 'src/common/utils/boolean.utils';
import { ItemImageEntity } from './entities/item-image.entity';


@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemEntity)
    private itemRepository: Repository<ItemEntity>,
    @InjectRepository(ItemImageEntity)
    private itemImageRepository: Repository<ItemImageEntity>,
    private storageService: StorageService,
    private categoryService: CategoryService,
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
      category: categoryId,
    } = createItemDto;

    try {
      const category = await this.categoryService.findOneById(categoryId);
      if (!category) throw new NotFoundException("category not found");

      const newItem = this.itemRepository.create({
        title,
        ingredients,
        description,
        price: Number(price),
        discount: Number(discount),
        quantity: Number(quantity),
        category: { id: categoryId },
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
        category: categoryId
      } = updateItemDto;

      const item = await this.itemRepository.findOne({
        where: { id: itemId },
        relations: ["images"],
      });
      if (!item) throw new NotFoundException("Item Not Found");

      if (categoryId) {
        const category = await this.categoryService.findOneById(categoryId);
        if (!category) throw new NotFoundException("Category Not Found");
      }

      const updateObject: DeepPartial<ItemEntity> = {};
      if (title) updateObject.title = title;
      if (ingredients) updateObject.ingredients = ingredients;
      if (description) updateObject.description = description;
      if (price) updateObject.price = +price;
      if (discount) updateObject.discount = +discount;
      if (quantity) updateObject.quantity = +quantity

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
    response: Response
  ): Promise<Response> {
    try {
      const items = await this.itemRepository.find({ relations: ['images', 'category'] });
      return response
        .status(HttpStatus.OK)
        .json({
          data: items,
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
  async getItemById(
    itemId: string,
    response: Response
  ): Promise<Response> {
    try {
      const item = await this.itemRepository.findOne({
        where: { id: itemId },
        relations: ['category', 'images'],
      });
      if (!item) throw new NotFoundException("Item Not Found");

      return response
        .status(HttpStatus.OK)
        .json({
          data: item,
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
  async deleteItemById(
    menuId: string,
    response: Response
  ): Promise<Response> {
    try {
      const item = await this.itemRepository.delete({ id: menuId })
      if (!item) {
        return response
          .status(HttpStatus.OK)
          .json({
            message: "Item Not Found",
            statusCode: HttpStatus.NOT_FOUND
          })
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
        .where('item.title ILIKE :search', { search: `%${searchQuery}%` })
        .orWhere('item.description ILIKE :search', { search: `%${searchQuery}%` })
        .getMany();

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

}
