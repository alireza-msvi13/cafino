
import { ProfileService } from './profile.service';
import { Response } from 'express';
import { Body, Controller, Delete, Get, Put, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
    constructor(
        private profileService: ProfileService
    ) { }


    @Get('orders')
    @ApiOperation({ summary: " user orders " })
    async getUserOrders(
        @Query() paginationDto: PaginationDto,
        @GetUser('id') userId: string,
        @Res() response: Response
    ): Promise<Response> {
        return await this.profileService.getUserOrders(
            userId,
            paginationDto,
            response
        );
    }

    @Put('orders/:id')
    @ApiOperation({ summary: " cancel order " })
    async cancelOrder(
        @Query("id", UUIDValidationPipe) orderId: string,
        @Res() response: Response
    ): Promise<Response> {
        return await this.profileService.cancelOrder(
            orderId,
            response
        );
    }

    @Put('update')
    @ApiOperation({ summary: "update user profile " })
    async updateUser(
        @Body() updateUserDto: UpdateUserDto,
        @GetUser('id') userId: string,
        @Res() response: Response
    ): Promise<Response> {
        return await this.profileService.updateUser(
            updateUserDto,
            userId,
            response
        );
    }

    @Post('address')
    @ApiOperation({ summary: "create new user address" })
    async createAddress(
        @Body() createAddressDto: CreateAddressDto,
        @GetUser('id') userId: string,
        @Res() response: Response,
    ): Promise<Response> {
        return await this.profileService.createAddress(
            userId,
            createAddressDto,
            response
        );
    }

    @Put('address/:id')
    @ApiOperation({ summary: "update user address by address-id" })
    async updateAddress(
        @Res() response: Response,
        @Body() updateAddressDto: UpdateAddressDto,
        @Param('id', UUIDValidationPipe) addressId: string
    ): Promise<Response> {
        return await this.profileService.updateAddress(
            addressId,
            response,
            updateAddressDto,
        );
    }

    @Delete('address/:id')
    @ApiOperation({ summary: "delete user address by address-id" })
    async deleteAddress(
        @Res() response: Response,
        @Param('id', UUIDValidationPipe) addressId: string
    ): Promise<Response> {
        return await this.profileService.deleteAddress(
            addressId,
            response,
        );
    }


    @Get('address')
    @ApiOperation({ summary: "get all user addresses" })
    async getAddresses(
        @GetUser('id') userId: string,
        @Res() response: Response,
    ): Promise<Response> {
        return await this.profileService.getAddresses(
            userId,
            response
        );
    }

    @Patch('image')
    @ApiConsumes(SwaggerContentTypes.MULTIPART)
    @ApiOperation({ summary: "update user image" })
    @UseInterceptors(UploadFileAws('image'))
    async updateImage(
        @UploadedFile() image: MulterFileType,
        @Body() updateImageDto: UpdateImageDto,
        @GetUser('id') userId: string,
        @Res() response: Response
    ) {
        return await this.profileService.updateImage(
            userId,
            image,
            response
        )
    }

    @Delete('image')
    @ApiOperation({ summary: "delete user image " })
    async deleteImage(
        @GetUser('id') userId: string,
        @Res() response: Response
    ) {
        return await this.profileService.deleteImage(
            userId,
            response
        )
    }


    @Post('favorite')
    @ApiOperation({ summary: "add item to favorite item" })
    async addToFavorite(
        @GetUser('id') userId: string,
        @Res() response: Response,
        @Query("itemId", UUIDValidationPipe) itemId: string
    ): Promise<Response> {
        return this.profileService.addToFavorite(
            userId,
            itemId,
            response
        );
    }

    @Delete('favorite')
    @ApiOperation({ summary: "delete item from favorite item " })
    async removeFromFavorite(
        @GetUser('id') userId: string,
        @Res() response: Response,
        @Query("itemId", UUIDValidationPipe) itemId: string
    ): Promise<Response> {
        return this.profileService.removeFromFavorite(
            userId,
            itemId,
            response
        );
    }

    @Get('favorites')
    @ApiOperation({ summary: "get user favorites" })
    findUserFavorites(
        @GetUser('id') userId: string,
        @Res() response: Response,
        @Query() paginationDto: PaginationDto,
    ) {
        return this.profileService.findUserFavorites(userId, paginationDto, response);
    }
}


