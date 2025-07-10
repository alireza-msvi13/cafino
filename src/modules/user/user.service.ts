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
import { Roles } from 'src/common/enums/role.enum';
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
            await this.userRepository.delete({ id: addressId })
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
            await this.favoriteRepository.delete({
                user: { id: userId },
                item: { id: itemId }
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
    async findUserFavorites(userId: string, paginationDto: PaginationDto) {
        try {

            const { limit = 10, page = 1 } = paginationDto;


            const baseQuery = this.favoriteRepository
                .createQueryBuilder('favorite')
                .leftJoinAndSelect("items.item", "item")
                .where("order.user.id = :userId", { userId });


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
        try {
            const user = await this.userRepository.findOne({
                where: { phone },
                relations,
            });

            if (!user) {
                throw new NotFoundException("user not found")
            }
            return user;
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
    async findUserById(id: string, relations: string[] = []): Promise<UserEntity> {
        try {
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
    async createUser(
        phone: string
    ): Promise<UserEntity> {
        try {
            let user = await this.userRepository.findOne({
                where: { phone },
            });

            if (user && user.status === UserStatus.Block) {
                throw new NotFoundException(
                    "unfortunately you are in the blacklist",
                )
            }

            if (user) return user

            user = this.userRepository.create({
                username: `user_${crypto.randomUUID().split('-')[0]}`,
                phone
            });

            const userCount = await this.userRepository.count();
            if (!userCount) user.role = Roles.Admin;

            await this.userRepository.save(user)

            return user
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
    async saveOtp(
        code: string,
        expireIn: Date,
        userId: string,
        phone: string
    ): Promise<void> {
        try {
            let otp = await this.otpRepository.findOne({
                where: { user: { id: userId } },
            });

            if (otp) {
                otp.code = code,
                    otp.expires_in = expireIn
            } else {
                otp = this.otpRepository.create({
                    code,
                    expires_in: expireIn,
                    user: { id: userId },
                    phone
                })
            }
            await this.otpRepository.save(otp)

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
    async saveRefreshToken(
        phone: string,
        refreshToken: string
    ): Promise<void> {
        try {
            await this.userRepository.update(
                { phone },
                {
                    rt_hash: refreshToken
                }
            )
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
    async updateOtpCode(phone: string, otpCode: string, expireIn: Date) {
        try {
            const user = await this.findUser(phone, ['otp']);

            if (user && user.status === UserStatus.Block) {
                throw new NotFoundException(
                    "unfortunately you are in the blacklist",
                )
            }

            if (!user.otp) {
                throw new BadRequestException("previous code not found");
            }

            const now = new Date();


            if (now < user.otp.expires_in) {
                throw new BadRequestException(
                    "code is not expird yet"
                )
            }

            user.otp.code = otpCode
            user.otp.expires_in = expireIn

            await this.otpRepository.save(user.otp);
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
    async removeRefreshToken(
        phone: string
    ): Promise<void> {
        try {
            await this.userRepository.update(
                { phone },
                {
                    rt_hash: null
                }
            )
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
    async checkUsernameExist(
        username: string,
    ): Promise<void> {
        try {
            const isDuplicateUsername = await this.userRepository.findOne({
                where: { username }
            })
            if (isDuplicateUsername) {
                throw new ConflictException(
                    "username already used"
                )
            }
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
    async checkAddressExist(
        addressId: string,
    ): Promise<void> {
        try {
            const address = await this.addressRepository.findOne({
                where: { id: addressId }
            })
            if (!address) {
                throw new NotFoundException(
                    "address not found",
                );
            }
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
    async findUserByAddress(userId: string, addressId: string): Promise<AddressEntity> {
        try {
            const address = await this.addressRepository.findOne({
                where: {
                    id: addressId,
                    user: { id: userId }
                }
            })

            if (!address) throw new NotFoundException("address not found")

            return address;
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

}
