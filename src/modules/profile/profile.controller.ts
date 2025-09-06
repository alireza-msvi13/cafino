import { ProfileService } from './profile.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { SwaggerContentTypes } from 'src/common/enums/swagger.enum';
import { UpdateUserDto } from './dto/update-user-dto';
import { CreateAddressDto } from './dto/create-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';
import { UploadFileAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { UpdateImageDto } from './dto/update-image-dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';

@Controller('profile')
@ApiTags('Profile')
@UseGuards(JwtGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get user profile overview.' })
  async getOverview(@GetUser('id') userId: string) {
    return await this.profileService.getOverview(userId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get user orders.' })
  async getUserOrders(
    @Query() paginationDto: PaginationDto,
    @GetUser('id') userId: string,
  ) {
    return await this.profileService.getUserOrders(userId, paginationDto);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Cancel user order.' })
  async cancelOrder(@Query('id', UUIDValidationPipe) orderId: string) {
    return await this.profileService.cancelOrder(orderId);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update user profile.' })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('id') userId: string,
  ) {
    return await this.profileService.updateUser(updateUserDto, userId);
  }

  @Post('address')
  @ApiOperation({ summary: 'Create new user address.' })
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @GetUser('id') userId: string,
  ) {
    return await this.profileService.createAddress(userId, createAddressDto);
  }

  @Put('address/:id')
  @ApiOperation({ summary: 'Update user address by address-id.' })
  async updateAddress(
    @Body() updateAddressDto: UpdateAddressDto,
    @Param('id', UUIDValidationPipe) addressId: string,
  ) {
    return await this.profileService.updateAddress(addressId, updateAddressDto);
  }

  @Delete('address/:id')
  @ApiOperation({ summary: 'Delete user address by address-id.' })
  async deleteAddress(@Param('id', UUIDValidationPipe) addressId: string) {
    return await this.profileService.deleteAddress(addressId);
  }

  @Get('address')
  @ApiOperation({ summary: 'Get all user addresses.' })
  async getAddresses(@GetUser('id') userId: string) {
    return await this.profileService.getAddresses(userId);
  }

  @Patch('image')
  @ApiConsumes(SwaggerContentTypes.Multipart)
  @ApiOperation({ summary: 'update user image' })
  @UseInterceptors(UploadFileAws('image'))
  async updateImage(
    @UploadedFile() image: MulterFileType,
    @Body() updateImageDto: UpdateImageDto,
    @GetUser('id') userId: string,
  ) {
    return await this.profileService.updateImage(userId, image);
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete user image.' })
  async deleteImage(@GetUser('id') userId: string) {
    return await this.profileService.deleteImage(userId);
  }

  @Post('favorite')
  @ApiOperation({ summary: 'Add item to favorite item.' })
  async addToFavorite(
    @GetUser('id') userId: string,
    @Query('itemId', UUIDValidationPipe) itemId: string,
  ) {
    return this.profileService.addToFavorite(userId, itemId);
  }

  @Delete('favorite')
  @ApiOperation({ summary: 'Delete item from favorite item.' })
  async removeFromFavorite(
    @GetUser('id') userId: string,
    @Query('itemId', UUIDValidationPipe) itemId: string,
  ) {
    return this.profileService.removeFromFavorite(userId, itemId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorites.' })
  findUserFavorites(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.profileService.findUserFavorites(userId, paginationDto);
  }
}
