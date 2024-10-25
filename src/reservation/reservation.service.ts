import _ from 'lodash';
import { Admin, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../admin/entities/category.entity';
import { ConcertCategory } from '../admin/entities/concertCategory.enitity';
import { Concert } from '../admin/entities/concert.entity';
import { Schedule } from '../admin/entities/schedules.entity';
import { HallReservation } from '../admin/entities/hallReservation.entity';
import { Hall } from '../admin/entities/hall.entity';
import { Seat } from '../admin/entities/seat.entity';
import { Class } from '../admin/entities/class.entity';
import { Payment } from './entities/payments.entity';
import { Reservation } from './entities/reservations.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(ConcertCategory)
    private readonly concertCategoryRepository: Repository<ConcertCategory>,

    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,

    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    @InjectRepository(HallReservation)
    private readonly hallReservationRepository: Repository<HallReservation>,

    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,

    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Reservation)
    private readonly reservation: Repository<Reservation>,
  ) {}
  async makeReservation(
    user: User,
    concert_name: string,
    schedule_id: number,
    seat_id: number,
    payment_method_id: number,
  ) {
    const findSeat = await this.seatRepository.findOne({
      where: { id: schedule_id },
      relations: { class: true },
      select: {
        state: true,
        class: {
          id: true,
          grade: true,
          price: true,
        },
      },
    });
    if (!findSeat) {
      throw new BadRequestException({
        message: '해당 좌석이 존재하지 않습니다.',
      });
    }
    if (findSeat.state === '예매 불가') {
      throw new ConflictException({ message: '이미 선택된 좌석입니다.' });
    }

    //결제요청(임의)
    const paymentRequest = {
      concert_name: concert_name,
      seat_id: seat_id,
      amount: findSeat.class.price,
      method_id: payment_method_id,
    };
    const paymentResult = await this.payment(paymentRequest);

    if (paymentResult.success!) {
      throw new ConflictException({
        message: '결제에 실패하였습니다. 다시 시도해 주세요.',
      });
    }

    findSeat.state = '예매 불가';
    await this.seatRepository.save({
      state: findSeat.state,
    });

    //결제 내역 저장
    const payment = this.paymentRepository.create({
      cost: findSeat.class.price,
      method_id: payment_method_id,
      state: '결제 완료',
      user_id: user.id,
      approve_numbers: paymentResult.approve_number,
      approvedAt: paymentResult.approve_time,
    });
  }

  /**임의 결제 함수
   *
   * @param paymentRequest
   * @returns
   */
  async payment(paymentRequest: {
    concert_name: string;
    seat_id: number;
    amount: number;
    method_id: number;
  }) {
    return {
      success: true,
      approve_number: Math.random,
      approve_time: new Date(),
    };
  }
}
