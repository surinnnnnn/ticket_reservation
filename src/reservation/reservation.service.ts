import _ from 'lodash';
import { Repository, Transaction, DataSource } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Concert } from '../admin/entities/concert.entity';
import { Schedule } from '../admin/entities/schedules.entity';
import { Seat } from '../admin/entities/seat.entity';
import { Payment } from './entities/payments.entity';
import { Reservation } from './entities/reservations.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,

    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    private dataSource: DataSource,
  ) {}

  async makeReservation(
    user: User,
    concert_name: string,
    schedule_id: number,
    seat_id: number,
    payment_method_id: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findConcert = await this.concertRepository.findOne({
        where: { name: concert_name },
      });
      if (!findConcert) {
        throw new BadRequestException(
          '해당 이름의 콘서트가 존재 하지 않습니다.',
        );
      }

      const findSchedule = await this.scheduleRepository.findOne({
        where: { id: schedule_id },
      });
      if (!findSchedule) {
        throw new BadRequestException('존재 하지 않는 스케쥴입니다.');
      }

      const findSeat = await this.seatRepository
        .createQueryBuilder('seat')
        .leftJoinAndSelect('seat.class', 'class')
        .where('seat.id = :seat_id', { seat_id })
        .select(['seat.state', 'class.id', 'class.grade', 'class.price'])
        .getOne();
      if (!findSeat) {
        throw new BadRequestException({
          message: '해당 좌석이 존재하지 않습니다.',
        });
      }
      if (findSeat.state === '예매 불가') {
        throw new ConflictException('이미 선택된 좌석입니다.');
      }

      //결제요청
      const paymentRequest = {
        concert_name: concert_name,
        seat_id: seat_id,
        amount: findSeat.class.price,
        method_id: payment_method_id,
      };
      const paymentResult = await this.payment(paymentRequest);

      if (!paymentResult.success) {
        throw new ConflictException(
          '결제에 실패하였습니다. 다시 시도해 주세요.',
        );
      }

      findSeat.state = '예매 불가';
      await this.seatRepository.update(seat_id, { state: findSeat.state });

      //결제 내역 저장
      const payment = this.paymentRepository.create({
        cost: findSeat.class.price,
        paymentMethod: { id: payment_method_id },
        state: '결제 완료',
        user: { id: user.id },
        approve_number: paymentResult.approve_number,
        approvedAt: paymentResult.approve_time,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      //예약 정보 저장
      const reservation = this.reservationRepository.create({
        seat: { id: seat_id },
        concert: { id: findConcert.id },
        payment: { id: savedPayment.id },
      });

      const savedReservation =
        await this.reservationRepository.save(reservation);

      return {
        status_code: 201,
        message: '예약이 완료되었습니다.',
        reservation_info: {
          concert_name,
          date: findSchedule.date,
          seat_id: seat_id,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
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
      approve_number:
        Math.floor(Math.random() * (10 ** 6 - 10 ** 5 + 1)) + 10 ** 5,
      approve_time: new Date(),
    };
  }
}
