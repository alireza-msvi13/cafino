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
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { UploadFileAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmptyStringToUndefindInterceptor } from 'src/common/interceptors/empty-string-to-undefind.interceptor';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import {
  CreateCategoryDoc,
  DeleteCategoryDoc,
  FindAllByAdminDoc,
  FindAllDoc,
  FindByIdDoc,
  FindByPaginationDoc,
  UpdateCategoryDoc,
} from './decorators/swagger.decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { Roles } from 'src/common/enums/role.enum';

@Controller('category')
@ApiTags('Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @UseInterceptors(UploadFileAws('image'))
  @CreateCategoryDoc()
  create(
    @UploadedFile() image: MulterFileType,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.create(createCategoryDto, image);
  }

  @Get('/pagination')
  @FindByPaginationDoc()
  findByPagination(@Query() pagination: PaginationDto) {
    return this.categoryService.findByPagination(pagination);
  }

  @Get()
  @FindAllDoc()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @FindAllByAdminDoc()
  findAllByAdmin(@Query() pagination: PaginationDto) {
    return this.categoryService.findByPaginationByAdmin(pagination);
  }

  @Get(':id')
  @FindByIdDoc()
  findById(@Param('id', UUIDValidationPipe) id: string) {
    return this.categoryService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @UseInterceptors(UploadFileAws('image'), EmptyStringToUndefindInterceptor)
  @UpdateCategoryDoc()
  update(
    @Param('id', UUIDValidationPipe) categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() image: MulterFileType,
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto, image);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @DeleteCategoryDoc()
  delete(@Param('id', UUIDValidationPipe) categoryId: string) {
    return this.categoryService.delete(categoryId);
  }
}
