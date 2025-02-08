
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
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

@Controller('item')
export class ItemController {
  constructor(
    private itemService: ItemService,
  ) { }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'))
  @ApiOperation({ summary: "create new menu item" })
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
  @ApiOperation({ summary: "get all items" })
  async getAllItem(
    @Res() response: Response,
    @Query() paginationDto: PaginationDto,
  ): Promise<Response> {
    return this.itemService.getAllItems(
      response,
      paginationDto
    )
  }

  @Get('admin')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "get all items by admin, including items that are not allowed to be shown" })
  async getAllItemsByAdmin(
    @Res() response: Response,
  ): Promise<Response> {
    return this.itemService.getAllItemsByAdmin(
      response,
    )
  }

  @Get("/:id")
  @ApiOperation({ summary: "get item by id " })
  async getItemById(
    @Param("id",
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException("Invalid Item Id"),
      })
    ) itemId: string,
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.getItemById(
      itemId,
      response
    )
  }

  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "delete a menu item" })
  @Delete('/:id')
  async deleteItemById(
    @Param("id",
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException("Invalid Item Id"),
      })
    ) itemId: string,
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.deleteItemById(
      itemId,
      response
    )
  }

  @Put("/:itemId")
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'), EmptyStringToUndefindInterceptor)
  @ApiOperation({ summary: "update menu item" })
  @ApiConsumes(SwaggerContentTypes.MULTIPART)
  async updateItem(
    @StringToArray('ingredients') _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() updateFoodDto: UpdateItemDto,
    @Res() response: Response,
    @Param("id",
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException("Invalid Item Id"),
      })
    ) itemId: string
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
    @Param('search') searchQuery: string,
    @Res() response: Response,
  ): Promise<Response> {
    console.log(searchQuery);

    return this.itemService.searchItem(
      searchQuery,
      response
    )
  }
}
