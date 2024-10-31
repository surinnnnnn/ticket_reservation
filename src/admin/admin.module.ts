import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ConcertCategory } from './entities/concertCategory.enitity';
import { Concert } from './entities/concert.entity';
import { Schedule } from './entities/schedules.entity';
import { Hall } from './entities/hall.entity';
import { HallReservation } from './entities/hallReservation.entity';
import { Seat } from './entities/seat.entity';
import { Class } from './entities/class.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Category,
      ConcertCategory,
      Concert,
      Schedule,
      Hall,
      HallReservation,
      Seat,
      Class,
    ]),
  ],
  providers: [AdminService],
  exports: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
