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


@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemEntity)
    private itemRepository: Repository<ItemEntity>,
    private storageService: StorageService,
    private categoryService: CategoryService,
  ) { }


  // *primary

  async create(
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
    } = createItemDto

    try {

      const category = await this.categoryService.findOneById(categoryId)
      if (!category) throw new NotFoundException("category not found");

      const imagesArray = images.map(
        image => image.filename
      )
      const imagesUrl = images.map(
        image => {
          return this.storageService.getFileLink(
            image.filename,
            Folder.Item
          )
        })

      await Promise.all([
        this.storageService.uploadMultiFile(
          images,
          Folder.Item
        ),
        this.itemRepository.save({
          title,
          ingredients,
          description,
          price,
          discount,
          quantity,
          category: { id: categoryId },
          images: imagesArray,
          imagesUrl
        })
      ])

      return response
        .status(HttpStatus.CREATED)
        .json({
          message: "Item Created Successfully",
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
  async update(
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
        category: categoryId
      } = updateItemDto;


      const item = await this.itemRepository.findOneBy({ id: itemId })
      if (!item) throw new NotFoundException("Item Not Found");

      const category = await this.categoryService.findOneById(categoryId);
      if (!category) throw new NotFoundException("Category Not Found");


      const updateObject: DeepPartial<ItemEntity> = {};

      if (title) updateObject.title = title;
      if (ingredients) updateObject.ingredients = ingredients;
      if (description) updateObject.description = description;
      if (price) updateObject.price = price;
      if (discount) updateObject.discount = discount;

      if (images) {
        if (item && item?.images && item?.imagesUrl) {
          images.map(async image => (
            await this.storageService.deleteFile(image.filename, Folder.Item)
          ))
        }
        const imagesArray = images.map(
          image => image.filename
        )
        const imagesUrl = images.map(
          image => {
            return this.storageService.getFileLink(
              image.filename,
              Folder.Item
            )
          })
        await this.storageService.uploadMultiFile(
          images,
          Folder.Item
        )

        updateObject.images = imagesArray
        updateObject.imagesUrl = imagesUrl

      }

      await this.itemRepository.update({ id: itemId }, updateObject);

      return response
        .status(HttpStatus.OK)
        .json({
          message: "Item Update Successfully",
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
  async getAllItems(
    response: Response
  ): Promise<Response> {
    try {
      const items = await this.itemRepository.find({});
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
        relations: ['category'],
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
  async searchItem(
    searchQuery: string,
    response: Response
  ) {
    try {
      const items = await this.itemRepository
        .createQueryBuilder('item')
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
