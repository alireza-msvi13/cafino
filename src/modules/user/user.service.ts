import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from './entities/otp.entity';
import { UserStatus } from '../../common/enums/user-status.enum';
import { UpdateUserDto } from '../profile/dto/update-user-dto';
import { CreateAddressDto } from '../profile/dto/create-address-dto';
import { AddressEntity } from './entities/address.entity';
import { UpdateAddressDto } from '../profile/dto/update-address-dto';
import { FavoriteEntity } from './entities/favorite.entity';
import { UserPermissionDto } from './dto/permission.dto';
import { UserDto } from './dto/user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ServerResponse } from 'src/common/dto/server-response.dto';

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

    async getUserInfo(phone: string): Promise<ServerResponse> {
        const user = await this.findUser(phone, ["addressList"])
        const { otp, rt_hash, new_email, new_phone, ...sanitizedUser } = user;
        return new ServerResponse(HttpStatus.OK, 'User Info fetched successfully.', { user: sanitizedUser })
    }
    async getUsersList(paginationDto: PaginationDto): Promise<ServerResponse> {
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

        return new ServerResponse(HttpStatus.OK, 'Users fetched successfully.', {
            total,
            page,
            limit,
            users,
        })
    }
    async changeUserPermission(userPermissionDto: UserPermissionDto): Promise<ServerResponse> {
        const { phone, role } = userPermissionDto

        if (!["admin", "user"].includes(role)) {
            throw new BadRequestException('Invalid role.')
        }

        await this.userRepository.update({ phone }, {
            role
        })

        return new ServerResponse(HttpStatus.OK, `User role changed to ${role} successfully.`)
    }
    async addUserToBlacklist(userDto: UserDto): Promise<ServerResponse> {
        await this.userRepository.update(
            { phone: userDto.phone },
            {
                status: UserStatus.Block
            }
        )
        return new ServerResponse(HttpStatus.OK, 'User added to blacklist.')
    }
    async removeUserToBlacklist(userDto: UserDto): Promise<ServerResponse> {
        await this.userRepository.update(
            { phone: userDto.phone },
            {
                status: UserStatus.Normal
            }
        )
        return new ServerResponse(HttpStatus.OK, 'User removed from blacklist.')
    }
    async getBlacklist(paginationDto: PaginationDto): Promise<ServerResponse> {
        const { limit = 10, page = 1 } = paginationDto;

        const baseQuery = this.userRepository
            .createQueryBuilder('user')
            .where("user.status = :status", { status: UserStatus.Block });

        const total = await baseQuery.getCount();

        const data = await baseQuery
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return new ServerResponse(HttpStatus.OK, 'Blacklist fetched successfully.', {
            total,
            page,
            limit,
            users: data,
        })
    }
    async deleteUser(delteUserDto: UserDto): Promise<ServerResponse> {
        await this.userRepository.delete({
            phone: delteUserDto.phone
        })
        return new ServerResponse(HttpStatus.OK, 'User deleted fetched successfully.')
    }

    // *profile

    async updateUser(
        updateUserDto: UpdateUserDto,
        userId: string
    ): Promise<void> {
        const { username, email, first_name, last_name, birthday } = updateUserDto

        await this.userRepository.update({ id: userId }, {
            username,
            email,
            first_name,
            last_name,
            birthday
        })

    }
    async createAddress(
        userId: string,
        createAddressDto: CreateAddressDto
    ): Promise<void> {
        const { province, city, address } = createAddressDto
        const newAddress = this.addressRepository.create({
            province,
            city,
            address,
            user: { id: userId }
        })

        await this.addressRepository.save(newAddress)
    }
    async updateAddress(
        addressId: string,
        updateAddressDto: UpdateAddressDto,
    ): Promise<void> {
        const { province, city, address } = updateAddressDto
        await this.addressRepository.update({ id: addressId }, {
            province,
            city,
            address
        })
    }
    async deleteAddress(
        addressId: string
    ): Promise<void> {
        await this.addressRepository.delete({ id: addressId })
    }
    async getAddresses(
        userId: string,
    ) {
        const addresses = await this.addressRepository.find({
            where: { user: { id: userId } }
        })

        return addresses
    }
    async updateImage(
        userId: string,
        image: string,
        imageUrl: string
    ): Promise<void> {
        await this.userRepository.update({ id: userId }, {
            image,
            imageUrl
        })
    }
    async deleteImage(
        userId: string,
    ): Promise<void> {
        await this.userRepository.update({ id: userId }, {
            image: null,
            imageUrl: null
        })
    }
    async addToFavorite(
        userId: string,
        itemId: string
    ): Promise<void> {
        const item = await this.favoriteRepository.findOne({
            where: {
                user: { id: userId },
                item: { id: itemId }
            }
        })

        if (item) {
            throw new BadRequestException('Item is already exist in favorites.')
        }
        const newItem = this.favoriteRepository.create({
            user: { id: userId },
            item: { id: itemId }
        })
        await this.favoriteRepository.save(newItem)
    }
    async removeFromFavorite(
        userId: string,
        itemId: string
    ): Promise<void> {
        const favorite = await this.favoriteRepository.findOne({
            where: {
                user: { id: userId },
                item: { id: itemId }
            }
        });

        if (!favorite) {
            throw new NotFoundException("Favorite item not found.");
        }

        await this.favoriteRepository.remove(favorite);
    }
    async findUserFavorites(userId: string, paginationDto: PaginationDto) {
        const { limit = 10, page = 1 } = paginationDto;

        const baseQuery = this.favoriteRepository
            .createQueryBuilder('favorite')
            .leftJoinAndSelect('favorite.item', 'item')
            .leftJoin('favorite.user', 'user')
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
    }

    async countUserFavorites(userId: string) {
        return this.favoriteRepository
            .createQueryBuilder('favorite')
            .leftJoin('favorite.user', 'user')
            .where('user.id = :userId', { userId })
            .getCount();
    }
    async countUserAddresses(userId: string) {
        return this.addressRepository
            .createQueryBuilder('address')
            .leftJoin('address.user', 'user')
            .where('user.id = :userId', { userId })
            .getCount();
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
