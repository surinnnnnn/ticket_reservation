import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { ReservationService } from './reservation.service';
import { AuthGuard } from '@nestjs/passport';
import { MakeReservationDto } from './dto/makeReservation.dto';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('reservation')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly searchService: SearchService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('getConcertSeats')
  async getConcertSeats(@Query() makeReservationDto: MakeReservationDto) {
    return await this.searchService.getConcertSeats(
      makeReservationDto.concert_name,
      makeReservationDto.schedule_id,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reservation')
  async makeReservation(
    @UserInfo() user: User,
    makeReservationDto: MakeReservationDto,
  ) {
    return await this.reservationService.makeReservation(
      user,
      makeReservationDto.concert_name,
      makeReservationDto.schedule_id,
      makeReservationDto.seat_id,
      makeReservationDto.payment_method_id,
    );
  }
}
