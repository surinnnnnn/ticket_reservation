import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { PaymentMethod } from './entities/paymentMethod.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CryptoService } from '../crypto/crypto.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, PaymentMethod]),
  ],
  providers: [UserService, CryptoService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
