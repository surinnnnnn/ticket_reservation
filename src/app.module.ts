import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CryptoModule } from './crypto/crypto.module';

import { User } from './user/entities/user.entity';
import { PaymentMethod } from './user/entities/paymentMethod.entity';
import { Category } from './admin/entities/category.entity';
import { ConcertCategory } from './admin/entities/concertCategory.enitity';
import { Concert } from './admin/entities/concert.entity';
import { Schedule } from './admin/entities/schedules.entity';
import { Hall } from './admin/entities/hall.entity';
import { HallReservation } from './admin/entities/hallReservation.entity';
import { Seat } from './admin/entities/seat.entity';
import { Class } from './admin/entities/class.entity';
import { SearchModule } from './search/search.module';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [
      User,
      PaymentMethod,
      Category,
      ConcertCategory,
      Concert,
      Schedule,
      Hall,
      HallReservation,
      Seat,
      Class,
    ], // 엔티티는 반드시 여기에 명시!
    synchronize: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    CryptoModule,
    AdminModule,
    SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
