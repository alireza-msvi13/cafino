import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { OtpEntity } from './entities/otp.entity';
// import { AuthModule } from '../auth/auth.module';
import { AddressEntity } from './entities/address.entity';
import { FavoriteEntity } from './entities/favorite.entity';

@Module({
  imports: [
    // AuthModule,
    TypeOrmModule.forFeature([UserEntity, OtpEntity, AddressEntity, FavoriteEntity])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
