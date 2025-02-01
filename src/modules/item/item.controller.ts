
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { SwaggerTypes } from 'src/common/enums/swagger.enum';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UploadMultiFilesAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { StringToArray } from 'src/common/decorators/string-to-array.decorator';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('item')
export class ItemController {
  constructor(
    private itemService: ItemService,
  ) { }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'))
  @ApiOperation({ summary: "create new menu item" })
  @ApiConsumes(SwaggerTypes.MULTIPART)
  async create(
    @StringToArray("ingredients") _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() createFoodDto: CreateItemDto,
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.create(
      createFoodDto,
      images,
      response
    )
  }

  @Get("/all")
  @ApiOperation({ summary: "get all items" })
  async getFoods(
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.getAllItems(
      response
    )
  }

  @Get("/:id")
  @ApiOperation({ summary: "get item by id " })
  async getFoodById(
    @Param("id") itemId: string,
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.getItemById(
      itemId,
      response
    )
  }

  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "delete a menu item" })
  @Delete(':id')
  async deleteFoodById(
    @Param("id") itemId: string,
    @Res() response: Response
  ): Promise<Response> {
    return this.itemService.deleteItemById(
      itemId,
      response
    )
  }

  @Put("/:itemId")
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'))
  @ApiOperation({ summary: "update menu item" })
  @ApiConsumes(SwaggerTypes.MULTIPART)
  async updateFood(
    @StringToArray('ingredients') _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() updateFoodDto: UpdateItemDto,
    @Res() response: Response,
    @Param("itemId") itemId: string
  ): Promise<Response> {
    return this.itemService.update(
      itemId,
      updateFoodDto,
      images,
      response
    )
  }



  @Get("/:search")
  @ApiOperation({ summary: "search item" })
  @ApiConsumes(SwaggerTypes.MULTIPART, SwaggerTypes.JSON)
  async searchItem(
    @Param('search') searchQuery: string,
    @Res() response: Response,
  ): Promise<Response> {
    return this.itemService.searchItem(
      searchQuery,
      response
    )
  }
}
