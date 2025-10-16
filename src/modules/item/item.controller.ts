import { query, Request, Response } from 'express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { UploadMultiFilesAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { StringToArray } from 'src/common/decorators/string-to-array.decorator';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { EmptyStringToUndefindInterceptor } from 'src/common/interceptors/empty-string-to-undefind.interceptor';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { SortItemDto } from './dto/sort-item.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-token.guard';
import { SearchItemDto } from './dto/search-item.dto';
import {
  CreateItemDoc,
  DeleteItemDoc,
  GetAllItemDoc,
  GetAllItemsByAdminDoc,
  GetItemByIdDoc,
  SearchItemDoc,
  UpdateItemDoc,
} from './decorators/swagger.decorators';
import { Roles } from 'src/common/enums/role.enum';
import { RolesAllowed } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller('item')
@ApiTags('Item')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @UseInterceptors(UploadMultiFilesAws('images'))
  @CreateItemDoc()
  async createItem(
    @StringToArray('ingredients') _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() createFoodDto: CreateItemDto,
  ) {
    return this.itemService.createItem(createFoodDto, images);
  }

  @Get()
  @UseGuards(OptionalJwtGuard)
  @GetAllItemDoc()
  async getAllItem(@Query() sortItemDto: SortItemDto, @Req() req: Request) {
    const userId = req?.user?.id || null;
    return this.itemService.getAllItems(userId, sortItemDto);
  }

  @Get('admin')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @GetAllItemsByAdminDoc()
  async getAllItemsByAdmin(@Query() sortItemDto: SortItemDto) {
    return this.itemService.getAllItemsByAdmin(sortItemDto);
  }

  @Get('item-:id/:slug?')
  @UseGuards(OptionalJwtGuard)
  @GetItemByIdDoc()
  async findById(
    @Param('id', UUIDValidationPipe) id: string,
    // @Param('slug') slug: string,
    // @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req?.user?.id || null;
    return await this.itemService.getItemById(id, userId);

    // const response = await this.itemService.getItemById(id, userId, slug);
    // if (response.statusCode === HttpStatus.MOVED_PERMANENTLY) {
    //   return res.redirect(301, response.data.redirectTo);
    // }
    // return res.json(response);
  }

  @Delete('/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @DeleteItemDoc()
  async deleteItemById(@Param('id', UUIDValidationPipe) itemId: string) {
    return this.itemService.deleteItemById(itemId);
  }

  @Put('/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesAllowed(Roles.Admin, Roles.SuperAdmin)
  @UseInterceptors(
    UploadMultiFilesAws('images'),
    EmptyStringToUndefindInterceptor,
  )
  @UpdateItemDoc()
  async updateItem(
    @StringToArray('ingredients') _: null,
    @UploadedFiles() images: Array<MulterFileType>,
    @Body() updateFoodDto: UpdateItemDto,
    @Param('id', UUIDValidationPipe) itemId: string,
  ) {
    return this.itemService.updateItem(itemId, updateFoodDto, images);
  }

  @Get('search/:search')
  @SearchItemDoc()
  async searchItem(@Query('search') query: SearchItemDto) {
    return this.itemService.searchItem(query);
  }
}
