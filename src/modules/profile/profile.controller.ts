
import { ProfileService } from './profile.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Body, Controller, Delete, Get, HttpStatus, Put, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { SwaggerContentTypes } from 'src/common/enums/swagger.enum';
import { UpdateUserDto } from './dto/update-user-dto';
import { EmptyStringToUndefindInterceptor } from 'src/common/interceptors/empty-string-to-undefind.interceptor';
import { CreateAddressDto } from './dto/create-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';
import { UploadFileAws } from 'src/common/interceptors/upload-file.interceptor';
import { MulterFileType } from 'src/common/types/multer.file.type';

@Controller('profile')
@UseGuards(JwtGuard)
export class ProfileController {
    constructor(
        private profileService: ProfileService,
        private configService: ConfigService
    ) { }


    // @UseGuards(JwtGuard)
    // @ApiOperation({ summary: " user orders " })
    // @Get('orders')
    // async getUserOrders(
    //     @GetUser('id') userId: string,
    //     @Res() response: Response
    // ): Promise<Response> {
    //     return await this.profileService.getUserOrders(
    //         userId,
    //         filterQuery,
    //         response
    //     );
    // }

    // @Put('orders/:id')
    // @ApiOperation({ summary: " cancel order " })
    // async cancelOrder(
    //     @Query("id") orderId: string,
    //     @Res() response: Response
    // ): Promise<Response> {
    //     return await this.profileService.cancelOrder(
    //         orderId,
    //         response
    //     );
    // }

    @Put('update')
    @UseInterceptors(EmptyStringToUndefindInterceptor)
    @ApiOperation({ summary: "update user profile " })
    @ApiConsumes(SwaggerContentTypes.FORM_URL_ENCODED, SwaggerContentTypes.JSON)
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
    @ApiConsumes(SwaggerContentTypes.FORM_URL_ENCODED, SwaggerContentTypes.JSON)
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
    @UseInterceptors(EmptyStringToUndefindInterceptor)
    @ApiOperation({ summary: "update user address by address-id" })
    @ApiConsumes(SwaggerContentTypes.FORM_URL_ENCODED, SwaggerContentTypes.JSON)
    async updateAddress(
        @Res() response: Response,
        @Body() updateAddressDto: UpdateAddressDto,
        @Param('id') addressId: string
    ): Promise<Response> {
        return await this.profileService.updateAddress(
            addressId,
            response,
            updateAddressDto,
        );
    }

    @Delete('address/:id')
    @ApiOperation({ summary: "delete user address by address-id" })
    @ApiConsumes(SwaggerContentTypes.FORM_URL_ENCODED, SwaggerContentTypes.JSON)
    async deleteAddress(
        @Res() response: Response,
        @Param('id') addressId: string
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
    @ApiOperation({ summary: "update user image" })
    @UseInterceptors(UploadFileAws('image'))
    @ApiConsumes(SwaggerContentTypes.MULTIPART)
    async updateImage(
        @UploadedFile() image: MulterFileType,
        @GetUser('id ') userId: string,
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
        @Query("itemId") itemId: string
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
        @Query("ItemId") ItemId: string
    ): Promise<Response> {
        return this.profileService.removeFromFavorite(
            userId,
            ItemId,
            response
        );
    }

    @Get()
    @ApiOperation({ summary: "get user favorites" })
    findUserFavorites(
        @GetUser('id') userId: string,
        @Res() response: Response,
    ) {
        return this.profileService.findUserFavorites(userId, response);
    }
}


