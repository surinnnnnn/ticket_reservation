import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from 'src/search/search.service';

import { ConcertCategory } from '../admin/entities/concertCategory.enitity';
import { Concert } from '../admin/entities/concert.entity';
import { Schedule } from '../admin/entities/schedules.entity';
import { Hall } from '../admin/entities/hall.entity';
import { Seat } from '../admin/entities/seat.entity';
import { Class } from '../admin/entities/class.entity';
import { Payment } from './entities/payments.entity';
import { Reservation } from './entities/reservations.entity';
import { PaymentMethod } from '../user/entities/paymentMethod.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      ConcertCategory,
      Concert,
      Schedule,
      Hall,
      Seat,
      Class,
      Payment,
      Reservation,
      PaymentMethod,
    ]),
  ],
  providers: [ReservationService, SearchService],
  controllers: [ReservationController],
})
export class ReservationModule {}
