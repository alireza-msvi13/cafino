import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { OtpEntity } from './entities/otp.entity';
// import { AuthModule } from '../auth/auth.module';
import { UserAddressEntity } from './entities/address.entity';

@Module({
  imports: [
    // AuthModule,
    TypeOrmModule.forFeature([UserEntity, OtpEntity , UserAddressEntity])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
