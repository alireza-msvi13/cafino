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
import { UpdateUserDto } from './dto/update-user-dto';
import { AddAddressDto } from './dto/add-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';
import { UploadFileAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';
import { UpdateImageDto } from './dto/update-image-dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UUIDValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import {
  AddAddressDoc,
  DeleteAddressDoc,
  GetUserAddressesDoc,
  GetUserProfileOverviewDoc,
  UpdateAddressDoc,
  UpdateUserProfileImageDoc,
  UpdateProfileByUserDoc,
  AddItemToFavoritesDoc,
  DeleteUserProfileImageDoc,
  DeleteFavoriteDoc,
  GetUserFavoritesDoc,
} from './decorators/swagger.decorators';

@Controller('profile')
@ApiTags('Profile')
@UseGuards(JwtGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('overview')
  @GetUserProfileOverviewDoc()
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

  // @Put('orders/:id')
  // @ApiOperation({ summary: 'Cancel order by user.' })
  // async cancelOrder(@Query('id', UUIDValidationPipe) orderId: string) {
  //   return await this.profileService.cancelOrder(orderId);
  // }

  @Put('update')
  @UpdateProfileByUserDoc()
  async UpdateProfileByUserDoc(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('id') userId: string,
  ) {
    return await this.profileService.UpdateProfileByUserDoc(
      updateUserDto,
      userId,
    );
  }

  @Post('address')
  @AddAddressDoc()
  async addAddress(
    @Body() addAddressDto: AddAddressDto,
    @GetUser('id') userId: string,
  ) {
    return await this.profileService.addAddress(userId, addAddressDto);
  }

  @Put('address/:id')
  @UpdateAddressDoc()
  async updateAddress(
    @Body() updateAddressDto: UpdateAddressDto,
    @Param('id', UUIDValidationPipe) addressId: string,
  ) {
    return await this.profileService.updateAddress(addressId, updateAddressDto);
  }

  @Delete('address/:id')
  @DeleteAddressDoc()
  async deleteAddress(@Param('id', UUIDValidationPipe) addressId: string) {
    return await this.profileService.deleteAddress(addressId);
  }

  @Get('address')
  @GetUserAddressesDoc()
  async getAddresses(@GetUser('id') userId: string) {
    return await this.profileService.getAddresses(userId);
  }

  @Patch('image')
  @UseInterceptors(UploadFileAws('image'))
  @UpdateUserProfileImageDoc()
  async updateImage(
    @UploadedFile() image: MulterFileType,
    @Body() _: UpdateImageDto,
    @GetUser('id') userId: string,
  ) {
    return await this.profileService.updateImage(userId, image);
  }

  @Delete('image')
  @DeleteUserProfileImageDoc()
  async deleteImage(@GetUser('id') userId: string) {
    return await this.profileService.deleteImage(userId);
  }

  @Post('favorite')
  @AddItemToFavoritesDoc()
  async addToFavorite(
    @GetUser('id') userId: string,
    @Query('itemId', UUIDValidationPipe) itemId: string,
  ) {
    return this.profileService.addToFavorite(userId, itemId);
  }

  @Delete('favorite')
  @DeleteFavoriteDoc()
  async removeFromFavorite(
    @GetUser('id') userId: string,
    @Query('itemId', UUIDValidationPipe) itemId: string,
  ) {
    return this.profileService.removeFromFavorite(userId, itemId);
  }

  @Get('favorites')
  @GetUserFavoritesDoc()
  findUserFavorites(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.profileService.findUserFavorites(userId, paginationDto);
  }
}
