import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from './entities/otp.entity';
import { UserStatus } from '../../common/enums/user-status.enum';
import { Response } from 'express';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';
import { UpdateUserDto } from '../profile/dto/update-user-dto';
import { CreateAddressDto } from '../profile/dto/create-address-dto';
import { AddressEntity } from './entities/address.entity';
import { UpdateAddressDto } from '../profile/dto/update-address-dto';
import { FavoriteEntity } from './entities/favorite.entity';
import { UserPermissionDto } from './dto/permission.dto';
import { UserDto } from './dto/user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(OtpEntity)
        private otpRepository: Repository<OtpEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        @InjectRepository(FavoriteEntity)
        private favoriteRepository: Repository<FavoriteEntity>,
    ) { }


    // *primary

    async getUserInfo(phone: string, response: Response) {
        try {

            const user = await this.findUser(phone, ["addressList"])
            const { otp, rt_hash, new_email, new_phone, ...sanitizedUser } = user;
            return response
                .status(HttpStatus.OK)
                .json({
                    data: sanitizedUser,
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            console.log(error);

            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async getUsersList(
        paginationDto: PaginationDto,
        response: Response
    ): Promise<Response> {
        try {
            const { limit = 10, page = 1 } = paginationDto;

            const baseQuery = this.userRepository
                .createQueryBuilder("user")
                .leftJoinAndSelect("user.addressList", "addressList")
                .select([
                    "user.id",
                    "user.username",
                    "user.first_name",
                    "user.last_name",
                    "user.birthday",
                    "user.image",
                    "user.phone",
                    "user.email",
                    "user.is_email_verified",
                    "user.role",
                    "user.status",
                    "user.created_at",
                    "user.updated_at",
                    "addressList.id",
                    "addressList.province",
                    "addressList.city",
                    "addressList.address",
                    "addressList.created_at"
                ]);

            const total = await baseQuery.getCount();

            const users = await baseQuery
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            return response.status(HttpStatus.OK).json({
                data: users,
                total,
                page,
                limit,
                statusCode: HttpStatus.OK,
            });

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async changeUserPermission(userPermissionDto: UserPermissionDto, response: Response) {
        try {

            const { phone, role } = userPermissionDto

            if (!["admin", "user"].includes(role)) {
                throw new BadRequestException('invalid role')
            }

            await this.userRepository.update({ phone }, {
                role
            })

            return response.status(HttpStatus.OK).json({
                message: `User Role Changed To ${role.toUpperCase()} Successfully`,
                statusCode: HttpStatus.OK,
            });

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async addUserToBlacklist(
        userDto: UserDto,
        response: Response
    ): Promise<Response> {
        try {
            await this.userRepository.update(
                { phone: userDto.phone },
                {
                    status: UserStatus.Block
                }
            )
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "User Added to Blacklist",
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async removeUserToBlacklist(
        userDto: UserDto,
        response: Response
    ): Promise<Response> {
        try {
            await this.userRepository.update(
                { phone: userDto.phone },
                {
                    status: UserStatus.Normal
                }
            )
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "User Removed to Blacklist",
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async getBlacklist(
        paginationDto: PaginationDto,
        response: Response
    ): Promise<Response> {
        try {

            const { limit = 10, page = 1 } = paginationDto;

            const baseQuery = this.userRepository
                .createQueryBuilder('user')
                .where("user.status = :status", { status: UserStatus.Block });

            const total = await baseQuery.getCount();

            const data = await baseQuery
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            return response
                .status(HttpStatus.OK)
                .json({
                    data,
                    total,
                    page,
                    limit,
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async deleteUser(
        delteUserDto: UserDto,
        response: Response
    ): Promise<Response> {
        try {
            await this.userRepository.delete({
                phone: delteUserDto.phone
            })
            return response
                .status(HttpStatus.OK)
                .json({
                    message: "User Deleted Successfully",
                    statusCode: HttpStatus.OK
                })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    // *profile

    async updateUser(
        updateUserDto: UpdateUserDto,
        userId: string
    ): Promise<void> {
        try {
            const { username, email, first_name, last_name, birthday } = updateUserDto

            await this.userRepository.update({ id: userId }, {
                username,
                email,
                first_name,
                last_name,
                birthday
            })

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async createAddress(
        userId: string,
        createAddressDto: CreateAddressDto
    ): Promise<void> {
        try {

            const { province, city, address } = createAddressDto
            const newAddress = this.addressRepository.create({
                province,
                city,
                address,
                user: { id: userId }
            })

            await this.addressRepository.save(newAddress)
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async updateAddress(
        addressId: string,
        updateAddressDto: UpdateAddressDto,
    ): Promise<void> {
        try {
            const { province, city, address } = updateAddressDto

            await this.addressRepository.update({ id: addressId }, {
                province,
                city,
                address
            })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async deleteAddress(
        addressId: string
    ): Promise<void> {
        try {
            await this.addressRepository.delete({ id: addressId })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async getAddresses(
        userId: string,
    ) {
        try {

            const addresses = await this.addressRepository.find({
                where: { user: { id: userId } }
            })

            return addresses
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async updateImage(
        userId: string,
        image: string,
        imageUrl: string
    ): Promise<void> {
        try {
            await this.userRepository.update({ id: userId }, {
                image,
                imageUrl
            })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async deleteImage(
        userId: string,
    ): Promise<void> {
        try {
            await this.userRepository.update({ id: userId }, {
                image: null,
                imageUrl: null
            })
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async addToFavorite(
        userId: string,
        itemId: string
    ): Promise<void> {
        try {
            const item = await this.favoriteRepository.findOne({
                where: {
                    user: { id: userId },
                    item: { id: itemId }
                }
            })

            if (item) {
                throw new BadRequestException('item is already exist in favorites')
            }
            const newItem = this.favoriteRepository.create({
                user: { id: userId },
                item: { id: itemId }
            })
            await this.favoriteRepository.save(newItem)
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async removeFromFavorite(
        userId: string,
        itemId: string
    ): Promise<void> {
        try {
            const favorite = await this.favoriteRepository.findOne({
                where: {
                    user: { id: userId },
                    item: { id: itemId }
                }
            });

            if (!favorite) {
                throw new NotFoundException("Favorite item not found");
            }

            await this.favoriteRepository.remove(favorite);

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
    async findUserFavorites(userId: string, paginationDto: PaginationDto) {
        try {

            const { limit = 10, page = 1 } = paginationDto;


            const baseQuery = this.favoriteRepository
                .createQueryBuilder('favorite')
                .leftJoinAndSelect('favorite.item', 'item') // item relation
                .leftJoin('favorite.user', 'user')         // user relation for filtering
                .where('user.id = :userId', { userId });


            const total = await baseQuery.getCount();

            const data = await baseQuery
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            return {
                data,
                total,
                page,
                limit,
            }
        } catch (error) {
            console.log(error);

            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    INTERNAL_SERVER_ERROR_MESSAGE,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }


    // *helper

    async findUser(phone: string, relations: string[] = []): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { phone },
            relations,
        });

        if (!user) {
            throw new NotFoundException("User not found")
        }
        return user;
    }
    async findUserById(id: string, relations: string[] = []): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations,
        });

        if (!user) {
            throw new NotFoundException(
                "user not found"
            );
        }
        return user;
    }
    async findByPhoneWithOtp(phone: string) {
        const user = await this.userRepository.findOne({
            where: { phone },
            relations: ['otp'],
        });
        return user;
    }
    async createUser(data: Partial<UserEntity>): Promise<UserEntity> {
        const user = this.userRepository.create(data);
        await this.userRepository.save(user);
        return user;
    }
    async countUsers() {
        const usersCount = await this.userRepository.count();
        return usersCount;
    }
    async saveOtp(
        code: string,
        expireIn: Date,
        userId: string,
        phone: string
    ): Promise<void> {
        const now = new Date();
        let otp = await this.otpRepository.findOne({
            where: { user: { id: userId } },
        });

        const LIMIT = 10;
        const WINDOW = 1 * 60 * 1000;

        if (otp) {
            if (otp.last_requested_at && now.getTime() - otp.last_requested_at.getTime() < WINDOW) {
                if ((otp.request_count || 0) >= LIMIT) {
                    throw new HttpException(
                        'You have reached the maximum number of OTP requests. Please try again later.',
                        HttpStatus.TOO_MANY_REQUESTS
                    );
                }
                otp.request_count += 1;
            } else {
                otp.request_count = 1;
            }

            otp.code = code;
            otp.expires_in = expireIn;
            otp.is_used = false;
            otp.last_requested_at = now;
        } else {
            otp = this.otpRepository.create({
                code,
                expires_in: expireIn,
                is_used: false,
                user: { id: userId },
                phone,
                request_count: 1,
                last_requested_at: now
            });
        }
        await this.otpRepository.save(otp)
    }
    async changeOtpStatusToUsed(
        otpId: string,
    ): Promise<void> {
        await this.otpRepository.update(
            { id: otpId },
            {
                is_used: true
            }
        )
    }
    async saveRefreshToken(
        phone: string,
        refreshToken: string
    ): Promise<void> {
        await this.userRepository.update(
            { phone },
            {
                rt_hash: refreshToken
            }
        )
    }
    async removeRefreshToken(
        phone?: string
    ): Promise<void> {
        if (!phone) return;
        await this.userRepository.update(
            { phone },
            {
                rt_hash: null
            }
        )
    }
    async checkUsernameExist(
        username: string,
    ): Promise<void> {
        const isDuplicateUsername = await this.userRepository.findOne({
            where: { username }
        })
        if (isDuplicateUsername) {
            throw new ConflictException(
                "Username already used"
            )
        }
    }
    async checkAddressExist(
        addressId: string,
    ): Promise<void> {
        const address = await this.addressRepository.findOne({
            where: { id: addressId }
        })
        if (!address) {
            throw new NotFoundException(
                "Address not found",
            );
        }
    }
    async findUserByAddress(userId: string, addressId: string): Promise<AddressEntity> {
        const address = await this.addressRepository.findOne({
            where: {
                id: addressId,
                user: { id: userId }
            }
        })

        if (!address) throw new NotFoundException("Address not found")

        return address;
    }
    async isItemFavorited(userId: string, itemId: string): Promise<boolean> {
        if (!userId) return false;

        const fav = await this.favoriteRepository.findOne({
            where: {
                user: { id: userId },
                item: { id: itemId }
            }
        });

        return !!fav;
    }
    async getFavoriteItemIds(userId: string): Promise<string[]> {
        if (!userId) return [];

        const favorites = await this.favoriteRepository.find({
            where: { user: { id: userId } },
            relations: ['item'],
            select: {
                item: {
                    id: true
                }
            }
        });

        return favorites.map(f => f.item.id);
    }
}
