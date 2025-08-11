
import { Request } from 'express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { SortItemDto } from './dto/sort-item.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-token.guard';
import { ServerResponse } from 'src/common/dto/server-response.dto';

@Controller('item')
@ApiTags('Item')
export class ItemController {
  constructor(
    private itemService: ItemService,
  ) { }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'))
  @ApiConsumes(SwaggerContentTypes.MULTIPART)
  @ApiOperation({ summary: "Create new menu item by admin." })
  async createItem(
    @StringToArray("ingredients") _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() createFoodDto: CreateItemDto,
  ) {
    return this.itemService.createItem(
      createFoodDto,
      images,
    )
  }


  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: "Get all items." })
  async getAllItem(
    @Query() sortItemDto: SortItemDto,
    @Req() req: Request,
  ) {
    const userId = req?.user?.id || null;
    return this.itemService.getAllItems(
      userId,
      sortItemDto
    )
  }

  @Get('admin')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "Get all items by admin, including items that are not allowed to be shown." })
  async getAllItemsByAdmin(
    @Query() sortItemDto: SortItemDto,
  ) {
    return this.itemService.getAllItemsByAdmin(
      sortItemDto,
    )
  }

  @Get("/:id")
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: "Get a item by id." })
  async getItemById(
    @Param("id", UUIDValidationPipe) itemId: string,
    @Req() req: Request,
  ) {
    const userId = req?.user?.id || null;
    return this.itemService.getItemById(
      itemId,
      userId,
    )
  }

  @UseGuards(JwtGuard, AdminGuard)
  @ApiOperation({ summary: "Delete a menu item by admin." })
  @Delete('/:id')
  async deleteItemById(
    @Param("id", UUIDValidationPipe) itemId: string
  ) {
    return this.itemService.deleteItemById(
      itemId
    )
  }

  @Put("/:id")
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(UploadMultiFilesAws('images'), EmptyStringToUndefindInterceptor)
  @ApiConsumes(SwaggerContentTypes.MULTIPART)
  @ApiOperation({ summary: "Update menu item by admin." })
  async updateItem(
    @StringToArray('ingredients') _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() updateFoodDto: UpdateItemDto,
    @Param("id", UUIDValidationPipe) itemId: string
  ) {
    return this.itemService.updateItem(
      itemId,
      updateFoodDto,
      images
    )
  }



  @Get("search/:search")
  @ApiOperation({ summary: "Search items." })
  async searchItem(
    @Query('search') searchQuery: string,
  ) {
    return this.itemService.searchItem(
      searchQuery,
    )
  }
}
