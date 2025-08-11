import { BadRequestException, ConflictException, forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { DeepPartial, Repository } from "typeorm";
import { StorageService } from "../storage/storage.service";
import { MulterFileType } from "src/common/types/multer.file.type";
import { Folder } from "src/common/enums/folder.enum";
import { isBoolean, toBoolean } from "src/common/utils/boolean.utils";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { ItemService } from "../item/item.service";
import { ServerResponse } from "src/common/dto/server-response.dto";

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
  ): Promise<ServerResponse> {

    let { title, slug, show } = createCategoryDto;

    const category = await this.categoryRepository.findOne({
      where: [{ slug }, { title }],
    });
    if (category) throw new ConflictException("Category already exist.");
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

    return new ServerResponse(HttpStatus.CREATED, 'Category created successfully.');

  }
  async findByPagination(paginationDto: PaginationDto) : Promise<ServerResponse>{
    const { limit = 10, page = 1 } = paginationDto;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where("category.show = :show", { show: true });

    const total = await queryBuilder.getCount();

    const categories = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new ServerResponse(HttpStatus.OK, 'Categories fetched successfully.', {
      total,
      page,
      limit,
      categories
    });
  }
  async findAll(): Promise<ServerResponse> {
    const categories = await this.categoryRepository.find({
      where: { show: true }
    })
    return new ServerResponse(HttpStatus.OK, 'Categories fetched successfully.', { categories });

  }
  async findByPaginationByAdmin(paginationDto: PaginationDto): Promise<ServerResponse> {
    const { limit = 10, page = 1 } = paginationDto;

    const queryBuilder = this.categoryRepository.createQueryBuilder('category')

    const total = await queryBuilder.getCount();

    const categories = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();


    return new ServerResponse(HttpStatus.OK, 'Categories fetched successfully.', {
      total,
      page,
      limit,
      categories
    });

  }
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    image: Express.Multer.File
  ): Promise<ServerResponse> {

    const { show, slug, title } = updateCategoryDto;
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException("Category not found.");
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

    if (isBoolean(show)) {
      const showStatus = toBoolean(show)
      updateObject.show = showStatus
      await this.itemService.updateItemShowStatusByCategoryId(id, showStatus)
    };
    if (slug) {
      const category = await this.categoryRepository.findOneBy({ slug });
      if (category) throw new ConflictException("Slug already exists.");
      updateObject.slug = slug;
    }

    await this.categoryRepository.update({ id }, updateObject);

    return new ServerResponse(HttpStatus.OK, 'Category updated successfully.');

  }
  async findBySlug(slug: string): Promise<ServerResponse> {
    const category = await this.categoryRepository.findOne({
      where: { slug, show: true }
    });

    if (!category) throw new NotFoundException("Category not found.");
    
    return new ServerResponse(HttpStatus.OK, 'Categorory fetched successfully.', { category });

  }
  async delete(id: string): Promise<ServerResponse> {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) throw new NotFoundException("Category not found.");

    if (category && category?.image && category?.imageUrl) {
      await this.storageService.deleteFile(category.image, Folder.Category)
    }

    await this.categoryRepository.delete({ id });

    return new ServerResponse(HttpStatus.OK, 'Categorory deleted successfully.');
  }


  // *helper

  async checkCategoryVisibility(id: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException("Category not found.");
    if (!category.show) throw new BadRequestException("Category is not allow to show.");
  }
}
