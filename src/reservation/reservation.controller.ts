import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { ReservationService } from './reservation.service';
import { AuthGuard } from '@nestjs/passport';
import { MakeReservationDto } from './dto/makeReservation.dto';
import { GetSeatsDto } from './dto/getSeats.dto';
import { CancelDto } from './dto/cancel.dto.ts';
import { UserInfo } from 'src/common.utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

import { TransactionInterceptor } from '../common.utils/transaction.interceptor';

@Controller('reservation')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly searchService: SearchService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('getConcertSeats')
  async getConcertSeats(@Query() getSeatsDto: GetSeatsDto) {
    return await this.searchService.getConcertSeats(
      getSeatsDto.concert_name,
      getSeatsDto.schedule_id,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(TransactionInterceptor)
  @Post('makeReservation')
  async makeReservation(
    @UserInfo() user: User,
    @Body() makeReservationDto: MakeReservationDto,
  ) {
    return await this.reservationService.makeReservation(
      user,
      makeReservationDto.concert_name,
      makeReservationDto.schedule_id,
      makeReservationDto.seat_number,
      makeReservationDto.payment_method_id,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getReservations')
  async getReservationInfos(@UserInfo() user: User) {
    return await this.reservationService.getReservationInfos(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(TransactionInterceptor)
  @Delete('cancelAndRefund')
  async cancelAndRefund(@UserInfo() user: User, @Body() cancleDto: CancelDto) {
    return await this.reservationService.cancelAndRefund(
      user,
      cancleDto.reservation_number,
      cancleDto.payment_method_id,
    );
  }
}
