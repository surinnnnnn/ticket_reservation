import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';

import { SearchController } from './search.controller';

import { ConcertCategory } from '../admin/entities/concertCategory.enitity';
import { Concert } from '../admin/entities/concert.entity';
import { Schedule } from '../admin/entities/schedules.entity';
import { Hall } from '../admin/entities/hall.entity';
import { Seat } from '../admin/entities/seat.entity';
import { Class } from '../admin/entities/class.entity';

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
    ]),
  ],
  providers: [SearchService],
  exports: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
