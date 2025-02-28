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
  Res,
  ParseUUIDPipe,
  BadRequestException,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SwaggerContentTypes } from "src/common/enums/swagger.enum";
import { JwtGuard } from "../auth/guards/access-token.guard";
import { UploadFileAws } from "src/common/interceptors/upload-file.interceptor";
import { MulterFileType } from "src/common/types/multer.file.type";
import { Response } from "express";
import { AdminGuard } from "../auth/guards/admin.guard";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { EmptyStringToUndefindInterceptor } from 'src/common/interceptors/empty-string-to-undefind.interceptor';

@Controller("category")
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadFileAws('image'))
  @ApiConsumes(SwaggerContentTypes.MULTIPART)
  @ApiOperation({ summary: "create new category" })
  create(
    @UploadedFile() image: MulterFileType,
    @Body() createCategoryDto: CreateCategoryDto,
    @Res() response: Response
  ) {
    return this.categoryService.create(createCategoryDto, image, response);
  }

  @Get("/pagination")
  @ApiOperation({ summary: "get categories by pagination" })
  findByPagination(
    @Query() pagination: PaginationDto,
    @Res() response: Response,
  ) {
    return this.categoryService.findByPagination(pagination, response);
  }

  @Get()
  @ApiOperation({ summary: "get all categories " })
  findAll(
    @Res() response: Response,
  ) {
    return this.categoryService.findAll(response);
  }

  @Get('admin')
  @ApiOperation({ summary: "get all categories by admin, including categories that are not allowed to be shown" })
  findAllByAdmin(
    @Res() response: Response,
  ) {
    return this.categoryService.findAllByAdmin(response);
  }

  @Get("/by-slug/:slug")
  @ApiOperation({ summary: "find category by slug" })
  findBySlug(
    @Param("slug") slug: string,
    @Res() response: Response
  ) {
    return this.categoryService.findBySlug(slug, response);
  }

  @Put(":id")
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadFileAws('image'), EmptyStringToUndefindInterceptor)
  @ApiConsumes(SwaggerContentTypes.MULTIPART)
  @ApiOperation({ summary: "update new category" })
  update(
    @Param("id",
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException("Invalid Category Id"),
      })
    ) categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() image: MulterFileType,
    @Res() response: Response

  ) {
    return this.categoryService.update(categoryId, updateCategoryDto, image, response);
  }

  @Delete(":id")
  @ApiOperation({ summary: "delete a category" })
  delete(@Param("id",
    new ParseUUIDPipe({
      exceptionFactory: () => new BadRequestException("Invalid Category Id"),
    })
  ) categoryId: string, @Res() response: Response) {
    return this.categoryService.delete(categoryId, response);
  }
}
