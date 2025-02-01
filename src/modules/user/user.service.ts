import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from './entities/otp.entity';
import { UserStatus } from './enum/status.enum';
import { Response } from 'express';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/constants/error.constant';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(OtpEntity)
        private otpRepository: Repository<OtpEntity>,
    ) { }


    // *primary

    async getUserInfo(phone: string, response: Response) {
        try {

            const user = await this.findUser(phone, ["addressesList"])
            const { otp, rt_hash, new_email, new_phone, ...sanitizedUser } = user;
            return response
                .status(HttpStatus.OK)
                .json({
                    data: sanitizedUser,
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
    async getUsersList(response: Response) {
        try {
            const users = await this.userRepository.find({
                relations: ['addressesList']
            });
            return response
                .status(HttpStatus.OK)
                .json({
                    data: users,
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

    // *helper

    async findUser(phone: string, relations: string[] = []): Promise<UserEntity> {
        try {
            const user = await this.userRepository.findOne({
                where: { phone },
                relations,
            });

            if (!user) {
                throw new HttpException(
                    "User Not Found",
                    HttpStatus.NOT_FOUND
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
                throw new HttpException(
                    "Unfortunately You are in the Blacklist",
                    HttpStatus.BAD_REQUEST
                )
            }

            if (user) return user

            user = this.userRepository.create({
                username: `user_${crypto.randomUUID().split('-')[0]}`,
                phone
            });

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

            const now = new Date();

            if (!user.otp) {
                throw new HttpException("Previous Code Not Found", HttpStatus.BAD_REQUEST);
            }

            if (now < user.otp.expires_in) {
                throw new HttpException(
                    "Code is Not Expird Yet", HttpStatus.BAD_REQUEST
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

}
