import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerContentTypes } from 'src/common/enums/swagger.enum';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { UploadFileAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmptyStringToUndefindInterceptor } from 'src/common/interceptors/empty-string-to-undefind.interceptor';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';

@Controller('category')
@ApiTags('Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadFileAws('image'))
  @ApiConsumes(SwaggerContentTypes.Multipart)
  @ApiOperation({ summary: 'Create new category by admin.' })
  create(
    @UploadedFile() image: MulterFileType,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.create(createCategoryDto, image);
  }

  @Get('/pagination')
  @ApiOperation({ summary: 'Get categories by pagination.' })
  findByPagination(@Query() pagination: PaginationDto) {
    return this.categoryService.findByPagination(pagination);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories.' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('admin')
  @ApiOperation({
    summary:
      'Get all categories by admin, including categories that are not allowed to be shown.',
  })
  findAllByAdmin(@Query() pagination: PaginationDto) {
    return this.categoryService.findByPaginationByAdmin(pagination);
  }

  @Get('/by-slug/:slug')
  @ApiOperation({ summary: 'Find category by slug.' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadFileAws('image'), EmptyStringToUndefindInterceptor)
  @ApiConsumes(SwaggerContentTypes.Multipart)
  @ApiOperation({ summary: 'Update new category by admin.' })
  update(
    @Param('id', UUIDValidationPipe) categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() image: MulterFileType,
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by admin.' })
  delete(@Param('id', UUIDValidationPipe) categoryId: string) {
    return this.categoryService.delete(categoryId);
  }
}
