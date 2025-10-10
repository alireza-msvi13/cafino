import {
  BadRequestException,
  ConflictException,
  forwardRef,
  GoneException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { DeepPartial, Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { ImageFolder } from 'src/common/enums/image-folder.enum';
import { isBoolean, toBoolean } from 'src/common/utils/boolean.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ItemService } from '../item/item.service';
import { ServerResponse } from 'src/common/dto/server-response.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private storageService: StorageService,
    @Inject(forwardRef(() => ItemService))
    private itemService: ItemService,
  ) {}

  // * primary

  async create(
    createCategoryDto: CreateCategoryDto,
    image: MulterFileType,
  ): Promise<ServerResponse> {
    let { title, show = true } = createCategoryDto;

    const category = await this.categoryRepository.findOne({
      where: [{ title }],
    });
    if (category)
      throw new ConflictException('A category with this title already exists.');
    if (isBoolean(show)) {
      show = toBoolean(show);
    }

    const imageUrl = this.storageService.getFileLink(
      image.filename,
      ImageFolder.Category,
    );

    await Promise.all([
      this.storageService.uploadSingleFile(
        image.filename,
        image.buffer,
        ImageFolder.Category,
      ),

      this.categoryRepository.insert({
        title,
        show,
        image: image.filename,
        imageUrl,
      }),
    ]);

    return new ServerResponse(
      HttpStatus.CREATED,
      'Category created successfully.',
    );
  }
  async findByPagination(
    paginationDto: PaginationDto,
  ): Promise<ServerResponse> {
    const { limit = 10, page = 1 } = paginationDto;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.show = :show', { show: true });

    const total = await queryBuilder.getCount();

    const categories = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new ServerResponse(
      HttpStatus.OK,
      'Categories fetched successfully.',
      {
        total,
        page,
        limit,
        categories,
      },
    );
  }
  async findAll(): Promise<ServerResponse> {
    const categories = await this.categoryRepository.find({
      where: { show: true },
    });
    return new ServerResponse(
      HttpStatus.OK,
      'Categories fetched successfully.',
      { categories },
    );
  }
  async findByPaginationByAdmin(
    paginationDto: PaginationDto,
  ): Promise<ServerResponse> {
    const { limit = 10, page = 1 } = paginationDto;

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    const total = await queryBuilder.getCount();

    const categories = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new ServerResponse(
      HttpStatus.OK,
      'Categories fetched successfully.',
      {
        total,
        page,
        limit,
        categories,
      },
    );
  }
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    image: Express.Multer.File,
  ): Promise<ServerResponse> {
    const { show, title } = updateCategoryDto;
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found.');
    const updateObject: DeepPartial<CategoryEntity> = {};

    if (title) {
      const category = await this.categoryRepository.findOneBy({ title });
      if (category) throw new ConflictException('Title already exists.');
      updateObject.title = title;
    }

    if (image) {
      const imageUrl = this.storageService.getFileLink(
        image.filename,
        ImageFolder.Category,
      );

      await this.storageService.uploadSingleFile(
        image.filename,
        image.buffer,
        ImageFolder.Category,
      );
      updateObject.image = image.filename;
      updateObject.imageUrl = imageUrl;
      if (category && category?.image && category?.imageUrl) {
        await this.storageService.deleteFile(
          category.image,
          ImageFolder.Category,
        );
      }
    }

    if (isBoolean(show)) {
      const showStatus = toBoolean(show);
      updateObject.show = showStatus;
      await this.itemService.updateItemShowStatusByCategoryId(id, showStatus);
    }

    const hasTextDataToUpdate = Object.keys(updateObject).length > 0;
    if (!hasTextDataToUpdate && !image) {
      return new ServerResponse(HttpStatus.OK, 'No changes were provided.');
    }

    await this.categoryRepository.update({ id }, updateObject);

    return new ServerResponse(HttpStatus.OK, 'Category updated successfully.');
  }
  async findById(id: string): Promise<ServerResponse> {
    const category = await this.categoryRepository.findOne({
      where: { id, show: true },
    });
    if (!category) throw new NotFoundException('Category not found.');
    return new ServerResponse(
      HttpStatus.OK,
      'Categorory fetched successfully.',
      { category },
    );
  }
  async delete(id: string): Promise<ServerResponse> {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.items', 'items')
      .leftJoinAndSelect('items.images', 'images')
      .leftJoinAndSelect('items.comments', 'comments')
      .leftJoinAndSelect('items.cart', 'cart')
      .leftJoinAndSelect('items.favorites', 'favorites')
      .where('category.id = :id', { id })
      .getOne();
    if (!category) throw new NotFoundException('Category not found.');
    await this.categoryRepository.softRemove(category);
    return new ServerResponse(HttpStatus.OK, 'Category deleted successfully.');
  }

  // *helper

  async checkCategoryVisibility(id: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found.');
    if (!category.show)
      throw new GoneException('Category is not allowed to show.');
  }
}
