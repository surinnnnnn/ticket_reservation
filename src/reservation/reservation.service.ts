import _ from 'lodash';
import { Repository, Transaction, DataSource, QueryRunner } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Scope,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Concert } from '../admin/entities/concert.entity';
import { Schedule } from '../admin/entities/schedules.entity';
import { Seat } from '../admin/entities/seat.entity';
import { Payment } from './entities/payments.entity';
import { Reservation } from './entities/reservations.entity';
import { User } from '../user/entities/user.entity';
import { PaymentMethod } from 'src/user/entities/paymentMethod.entity';

@Injectable({ scope: Scope.REQUEST })
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

    @InjectRepository(PaymentMethod)
    private paymentMethodReposytory: Repository<PaymentMethod>,

    private dataSource: DataSource,
  ) {}

  /** 예약 및 결제 함수
   *
   * @param user
   * @param concert_name
   * @param schedule_id
   * @param seat_id
   * @param payment_method_id
   * @returns
   */
  async makeReservation(
    user: User,
    concert_name: string,
    schedule_id: number,
    seat_id: number,
    payment_method_id: number,
  ) {
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
    }
  }

  /** 결제 내역 및 예매 정보 확인 함수
   *
   */
  async getReservationInfos(user: User) {
    try {
      console.log(user);
      const query = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.reservation', 'reservation')
        .leftJoinAndSelect('reservation.seat', 'seats')
        .leftJoinAndSelect('seats.class', 'class')
        .leftJoinAndSelect('seats.hallReservation', 'hallReservation')
        .leftJoinAndSelect('hallReservation.schedule', 'schedule')
        .leftJoinAndSelect('schedule.concert', 'concert')
        .leftJoinAndSelect('hallReservation.hall', 'hall')
        .where('payment.user_id = :id', { id: user.id })
        .getMany();

      let mappedInfos = query
        .filter((info) => info.reservation)
        .map((info) => ({
          reservation_number: info.reservation.id,
          content: info.reservation.seat.hallReservation.schedule.concert.name,
          schedule: info.reservation.seat.hallReservation.schedule.date,
          place: info.reservation.seat.hallReservation.hall.name,
          seat: info.reservation.seat.id,
          seat_class: info.reservation.seat.class.grade,
          cost: info.cost,
          card_approve_number: info.approve_number,
          approvedAt: info.approvedAt,
        }));

      if (!query) {
        mappedInfos = [];
      }

      return {
        stateCode: 200,
        user: `${user.nickname}(${user.account_id})님의 예매 내역`,
        mappedInfos,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async cancelAndRefund(
    user: User,
    reservation_number: number,
    payment_method_id: number,
  ) {
    try {
      const query = await this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.payment', 'payment')
        .leftJoinAndSelect('payment.paymentMethod', 'paymentMethod')
        .leftJoinAndSelect('reservation.seat', 'seats')
        .leftJoinAndSelect('seats.class', 'class')
        .leftJoinAndSelect('seats.hallReservation', 'hallReservation')
        .leftJoinAndSelect('hallReservation.schedule', 'schedule')
        .leftJoinAndSelect('schedule.concert', 'concert')
        .where('reservation.id = :reservationNumber', {
          reservationNumber: reservation_number,
        })
        .andWhere('payment.user_id = :id', { id: user.id })
        .andWhere('payment.method_id = :method_id', {
          method_id: payment_method_id,
        })
        .getOne();

      if (!query) {
        throw new BadRequestException(
          '등록하신 정보와 일치하는 예약 정보가 없습니다.',
        );
      }

      const concertDate = new Date(query.seat.hallReservation.schedule.date);
      const currDate = new Date();

      const remainHours = 3 * 60 * 60 * 1000; // 3시간

      if (concertDate.getTime() < currDate.getTime()) {
        throw new Error('이미 상영되어 취소할 수 없습니다.');
      }
      if (concertDate.getTime() - currDate.getTime() <= remainHours) {
        throw new Error('콘서트 시작 3시간 전에는 취소할 수 없습니다.');
      }

      //결제 취소 함수 호출
      const cancelResult = await this.cancelPayment(query.payment.id);

      if (!cancelResult) {
        throw new Error('결제 취소에 실패했습니다. 다시 시도해주세요.');
      }

      //좌석 정보 업데이트
      query.seat.state = '예매 가능';
      await this.seatRepository.save(query.seat);

      //reservation row 삭제
      await this.reservationRepository.remove(query);

      return {
        stateCode: 201,
        message: '예매가 취소되었습니다.',
      };
    } catch (error) {
      console.error(error);
      throw error;
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

  /** 임의 결체 취소 함수
   *
   * @param payment_id
   * @returns
   */
  async cancelPayment(payment_id: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id: payment_id },
    });
    if (!payment) {
      throw new BadRequestException('결제 정보를 찾을 수 없습니다.');
    }

    payment.state = '결제 취소';
    await this.paymentRepository.save(payment);

    const canceledDate = new Date();

    return [true, canceledDate];
  }
}
