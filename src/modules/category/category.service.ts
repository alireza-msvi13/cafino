import { ConflictException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { DeepPartial, Repository } from "typeorm";
import { StorageService } from "../storage/storage.service";
import { MulterFileType } from "src/common/types/multer.file.type";
import { Response } from "express";
import { Folder } from "src/common/enums/folder.enum";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "src/common/constants/error.constant";
import { isBoolean, toBoolean } from "src/common/utils/boolean.utils";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { ItemService } from "../item/item.service";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private storageService: StorageService,
    @Inject(forwardRef(() => ItemService))
    private itemService: ItemService
  ) { }


  // * primary

  async create(
    createCategoryDto: CreateCategoryDto,
    image: MulterFileType,
    response: Response
  ) {

    try {
      let { title, slug, show } = createCategoryDto;

      const category = await this.categoryRepository.findOne({
        where: [{ slug }, { title }],
      });
      if (category) throw new ConflictException("category already exist");
      if (isBoolean(show)) {
        show = toBoolean(show);
      }

      const imageUrl = this.storageService.getFileLink(
        image.filename,
        Folder.Category
      )

      await Promise.all([
        this.storageService.uploadSingleFile(
          image.filename,
          image.buffer,
          Folder.Category
        ),

        this.categoryRepository.insert({
          title,
          slug,
          show,
          image: image.filename,
          imageUrl
        })
      ])


      return response
        .status(HttpStatus.OK)
        .json({
          message: "Category Created Successfully",
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
  async findByPagination(paginationDto: PaginationDto, response: Response) {
    try {
      const { limit = 10, page = 1 } = paginationDto;

      const queryBuilder = this.categoryRepository
        .createQueryBuilder('category')
        .where("category.show = :show", { show: true });

      const total = await queryBuilder.getCount();

      const data = await queryBuilder
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

  async findAll(response: Response) {
    try {
      const data = await this.categoryRepository.find({
        where: { show: true }
      })
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
  async findByPaginationByAdmin(paginationDto: PaginationDto, response: Response) {
    try {
      const { limit = 10, page = 1 } = paginationDto;

      const queryBuilder = this.categoryRepository.createQueryBuilder('category')

      const total = await queryBuilder.getCount();

      const data = await queryBuilder
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
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    image: Express.Multer.File,
    response: Response
  ) {
    try {
      const { show, slug, title } = updateCategoryDto;
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) throw new NotFoundException("category not found");
      const updateObject: DeepPartial<CategoryEntity> = {};
      if (image) {
        const imageUrl = this.storageService.getFileLink(
          image.filename,
          Folder.Category
        )

        await this.storageService.uploadSingleFile(
          image.filename,
          image.buffer,
          Folder.Category
        )
        updateObject.image = image.filename
        updateObject.imageUrl = imageUrl
        if (category && category?.image && category?.imageUrl) {
          await this.storageService.deleteFile(category.image, Folder.Category)
        }
      }
      if (title) updateObject.title = title;
      if (show && isBoolean(show)) {
        const showStatus = toBoolean(show)
        updateObject.show = showStatus
        await this.itemService.updateItemShowStatusByCategoryId(id, showStatus)
      };
      if (slug) {
        const category = await this.categoryRepository.findOneBy({ slug });
        if (category) throw new NotFoundException("not found category by this id");
        updateObject.slug = slug;
      }

      await this.categoryRepository.update({ id }, updateObject);
      return response
        .status(HttpStatus.OK)
        .json({
          message: "Category Updated Successfully",
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
  async findBySlug(slug: string, response: Response) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { slug, show: true }
      });
      if (!category) throw new NotFoundException("not found category by this slug");

      return response
        .status(HttpStatus.OK)
        .json({
          data: category,
          message: "Category Created Successfully",
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
  async delete(id: string, response: Response) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) throw new NotFoundException("category not found");
      if (category && category?.image && category?.imageUrl) {
        await this.storageService.deleteFile(category.image, Folder.Category)
      }
      await this.categoryRepository.delete({ id });
      return response
        .status(HttpStatus.OK)
        .json({
          message: "Category Removed Successfully",
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


  // *helper

  async findOneById(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException("category not found");
    if (!category.show) throw new NotFoundException("category is not allow to show");
    return category;
  }
}
