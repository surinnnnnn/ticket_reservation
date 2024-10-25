import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';

import { ConcertCategory } from '../admin/entities/concertCategory.enitity';
import { Concert } from '../admin/entities/concert.entity';
import { Schedule } from '../admin/entities/schedules.entity';
import { Hall } from '../admin/entities/hall.entity';
import { Seat } from '../admin/entities/seat.entity';
import { Class } from '../admin/entities/class.entity';
import { HallReservation } from 'src/admin/entities/hallReservation.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(ConcertCategory)
    private readonly concertCategoryRepository: Repository<ConcertCategory>,

    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,

    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,

    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  /** 공연 목록 조회 함수
   *
   */
  async getConcerts() {
    try {
      const concerts = await this.concertRepository
        .createQueryBuilder('concert')
        .leftJoinAndSelect('concert.concertCategories', 'concertCategories') // 시리즈 및 카테고리
        .leftJoinAndSelect('concertCategories.category', 'category') // 카테고리 상세
        .leftJoinAndSelect('concert.schedules', 'schedules') // 스케줄
        .getMany();

      const mappedConcerts = concerts.map((concert) => ({
        name: concert.name,
        categories: concert.concertCategories.map(
          (category) => category.category.name,
        ),
        schedules: concert.schedules.map((schedule) => schedule.date),
      }));

      return { statusCode: 200, mappedConcerts };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '공연 목록 조회 중 서버 오류가 발생했습니다.',
      );
    }
  }

  async getConcertsBycategory() {
    try {
      const concerts = await this.concertCategoryRepository
        .createQueryBuilder('concertCategory')
        .leftJoinAndSelect('concertCategory.concert', 'concert') // 시리즈 및 카테고리
        .leftJoinAndSelect('concertCategory.category', 'category') // 카테고리 상세
        .leftJoinAndSelect('concert.schedules', 'schedules') // 스케줄
        .getMany();

      const mappedConcerts = concerts.map((concert) => ({
        name: concert.concert.name,
        categories: [concert.category.name],
        schedules: concert.concert.schedules.map((schedule) => schedule.date),
      }));

      return { statusCode: 200, mappedConcerts };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '공연 목록 조회 중 서버 오류가 발생했습니다.',
      );
    }
  }

  async searchConcert(concert_name: string) {
    try {
      const concert = await this.concertRepository
        .createQueryBuilder('concert')
        .leftJoinAndSelect('concert.concertCategories', 'concertCategories') // 시리즈 및 카테고리
        .leftJoinAndSelect('concertCategories.category', 'category') // 카테고리 상세
        .leftJoinAndSelect('concert.schedules', 'schedules') // 스케줄
        .where('concert.name = :name', { name: concert_name })
        .getOne();

      const mappedConcert = {
        image: concert.image,
        name: concert.name,
        categories: concert.concertCategories.map(
          (category) => category.category.name,
        ),
        schedules: concert.schedules.map((schedule) => schedule.date),
      };

      return { statusCode: 200, mappedConcert };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '공연 목록 조회 중 서버 오류가 발생했습니다.',
      );
    }
  }

  async fetchConcertDetails(concert_name: string, schedule_id?: number) {
    const query = this.concertRepository
      .createQueryBuilder('concert')
      .leftJoinAndSelect('concert.concertCategories', 'concertCategories')
      .leftJoinAndSelect('concertCategories.category', 'category')
      .leftJoinAndSelect('concert.schedules', 'schedule')
      .leftJoinAndSelect('schedule.hallReservations', 'hallReservations')
      .leftJoinAndSelect('hallReservations.seats', 'seat')
      .leftJoinAndSelect('hallReservations.hall', 'hall')
      .leftJoinAndSelect('seat.class', 'class')
      .where('concert.name = :name', { name: concert_name });

    if (schedule_id) {
      query.andWhere('schedule.id = :schedule', { schedule: schedule_id });
    }
    const concert = await query.getOne();

    if (!concert) {
      throw new BadRequestException('해당 공연이 존재하지 않습니다.');
    }

    return concert;
  }

  async searchConcertDetails(concert_name: string) {
    try {
      const concert = await this.fetchConcertDetails(concert_name);
      const mappedConcert = {
        id: concert.id,
        Image: concert.image,
        name: concert.name,
        description: concert.description,
        categories: concert.concertCategories.map(
          (category) => category.category.name,
        ),
        schedules: concert.schedules.map((schedule) => {
          const availability = schedule.hallReservations.some(
            (reservation) =>
              Array.isArray(reservation.seats) &&
              reservation.seats.some((seat) => seat.state === '예매 가능'),
          )
            ? '예매 가능'
            : '예매 불가';

          return {
            date: schedule.date,
            availability: availability,
            hall: schedule.hallReservations.map(
              (reservation) => reservation.hall.name,
            ),
          };
        }),
      };

      return {
        statusCode: 200,
        mappedConcert,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** 좌석 조회 (수정 필요[-])
   *
   * @param concert_name
   * @param schedule_id
   * @returns
   */
  async getConcertSeats(concert_name: string, schedule_id: number) {
    try {
      const concert = await this.fetchConcertDetails(concert_name, schedule_id);

      const mappedSeats = {
        name: concert.name,
        date: new Date(concert.schedules[0].date).toLocaleString(),
        hall: concert.schedules[0].hallReservations[0].hall.name,
        seats: concert.schedules[0].hallReservations[0].seats,
      };
      console.log(concert.schedules[0].hallReservations[0].seats);
      return {
        statusCode: 200,
        mappedSeats,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
