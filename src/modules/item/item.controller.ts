
import { Request, Response } from 'express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { SwaggerContentTypes } from 'src/common/enums/swagger.enum';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UploadMultiFilesAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { StringToArray } from 'src/common/decorators/string-to-array.decorator';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { EmptyStringToUndefindInterceptor } from 'src/common/interceptors/empty-string-to-undefind.interceptor';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { SortItemDto } from './dto/sort-item.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-token.guard';

@Controller('item')
@ApiTags('Item')
export class ItemController {
  constructor(
    private itemService: ItemService,
  ) { }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'))
  @ApiOperation({ summary: "create new menu item by admin" })
  @ApiConsumes(SwaggerContentTypes.MULTIPART)
  async createItem(
    @StringToArray("ingredients") _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() createFoodDto: CreateItemDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.createItem(
      createFoodDto,
      images,
      response
    )
  }


  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: "get all items" })
  async getAllItem(
    @Res() response: Response,
    @Query() sortItemDto: SortItemDto,
    @Req() req: Request,
  ): Promise<Response> {
    const userId = req?.user?.id || null;
    return this.itemService.getAllItems(
      response,
      userId,
      sortItemDto
    )
  }

  @Get('admin')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "get all items by admin, including items that are not allowed to be shown" })
  async getAllItemsByAdmin(
    @Res() response: Response,
    @Query() sortItemDto: SortItemDto,
  ): Promise<Response> {
    return this.itemService.getAllItemsByAdmin(
      sortItemDto,
      response,
    )
  }

  @Get("/:id")
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: "get item by id " })
  async getItemById(
    @Param("id", UUIDValidationPipe) itemId: string,
    @Res() response: Response,
    @Req() req: Request,
  ): Promise<Response> {
    const userId = req?.user?.id || null;
    return this.itemService.getItemById(
      itemId,
      userId,
      response
    )
  }

  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "delete a menu item by admin" })
  @Delete('/:id')
  async deleteItemById(
    @Param("id", UUIDValidationPipe) itemId: string,
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.deleteItemById(
      itemId,
      response
    )
  }

  @Put("/:id")
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'), EmptyStringToUndefindInterceptor)
  @ApiOperation({ summary: "update menu item by admin" })
  @ApiConsumes(SwaggerContentTypes.MULTIPART)
  async updateItem(
    @StringToArray('ingredients') _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() updateFoodDto: UpdateItemDto,
    @Res() response: Response,
    @Param("id", UUIDValidationPipe) itemId: string
  ): Promise<Response> {
    return this.itemService.updateItem(
      itemId,
      updateFoodDto,
      images,
      response
    )
  }



  @Get("search/:search")
  @ApiOperation({ summary: "search item" })
  async searchItem(
    @Query('search') searchQuery: string,
    @Res() response: Response,
  ): Promise<Response> {
    return this.itemService.searchItem(
      searchQuery,
      response
    )
  }
}
