import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
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

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private storageService: StorageService
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
      if (category) throw new ConflictException("Category Already Exist");
      if (isBoolean(show)) {
        show = toBoolean(show);
      }

      const imageUrl = this.storageService.getFileLink(
        image.filename,
        Folder.Category
      )

      await this.storageService.uploadSingleFile(
        image.filename,
        image.buffer,
        Folder.Category
      )

      await this.categoryRepository.insert({
        title,
        slug,
        show,
        image: image.filename,
        imageUrl
      });

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

      const { limit = 10, page = 1 } = paginationDto
      const query = this.categoryRepository.createQueryBuilder('category');
      query.skip((page - 1) * limit).take(limit)

      const data = await query.getMany()
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
  async findAll(response: Response) {
    try {
      const data = await this.categoryRepository.find({})
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
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    image: Express.Multer.File,
    response: Response
  ) {
    try {
      const { show, slug, title } = updateCategoryDto;
      const category = await this.findOneById(id);
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
      if (show && isBoolean(show)) updateObject.show = toBoolean(show);
      if (slug) {
        const category = await this.categoryRepository.findOneBy({ slug });
        if (category) throw new NotFoundException("Not Found Category by this Id");
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
        where: { slug }
      });
      if (!category) throw new NotFoundException("Not Found Category by this Slug");

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
      const category = await this.findOneById(id);
      if (!category) throw new NotFoundException("Category Not Found");
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
    return category;
  }
}
