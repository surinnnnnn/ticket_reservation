import { compare, hash } from 'bcrypt';
import _ from 'lodash';
import { Admin, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../crypto/crypto.service';
import { Role } from '../user/types/userRole.type';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ConcertCategory } from './entities/concertCategory.enitity';
import { Concert } from './entities/concert.entity';
import { Schedule } from './entities/schedules.entity';
import { HallReservation } from './entities/hallReservation.entity';
import { Hall } from './entities/hall.entity';
import { Seat } from './entities/seat.entity';
import { Class } from './entities/class.entity';

@Injectable()
export class AdminService {
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
  ) {}

  /**카테고리 저장 함수
   *
   * @param name
   * @param description
   * @returns
   */
  async postCategory(name: string, description: string) {
    try {
      const isExistCategoty = await this.categoryRepository.findOne({
        where: { name },
      });

      if (isExistCategoty) {
        throw new ConflictException('이미 등록된 카테고리입니다.');
      }

      const newCategory = this.categoryRepository.create({
        name,
        description,
      });

      await this.categoryRepository.save(newCategory);

      return {
        statusCode: 201,
        message: '카테고리가 등록되었습니다.',
        newCategory,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** 공연 저장 함수
   *
   * @param name
   * @param description
   * @param image
   * @param category_id
   * @param date
   * @param time
   * @param hall_id
   * @returns
   */
  async postConcert(
    name: string,
    description: string,
    image: string,
    category_id: number,
    date: string[],
    venue_id: number,
    hall_name: string,
  ) {
    try {
      // concert 테이블에 row 추가
      const newConcert = this.concertRepository.create({
        name,
        description,
        image,
      });

      const savedConcert = await this.concertRepository.save(newConcert);
      const findcategory = await this.categoryRepository.findOne({
        where: { id: category_id },
      });

      //concert_categories 테이블에 row 추가
      const newConcertcategory = this.concertCategoryRepository.create({
        concert: savedConcert,
        category: findcategory,
      });

      await this.concertCategoryRepository.save(newConcertcategory);

      // halls 테이블에 row 추가
      const newHall = this.hallRepository.create({
        venue_id,
        name: hall_name,
      });
      const savedHall = await this.hallRepository.save(newHall);

      //schedules 테이블에 날짜 수 만큼 row 추가
      for (const concertDate of date) {
        const newSchedule = this.scheduleRepository.create({
          concert: savedConcert,
          date: new Date(concertDate), // 문자열 -> datetime 변환
        });
        const savedSchedule = await this.scheduleRepository.save(newSchedule);

        // hallReservation 테이블에 예약 추가
        const newHallReservation = this.hallReservationRepository.create({
          hall: savedHall,
          schedule: savedSchedule,
        });
        await this.hallReservationRepository.save(newHallReservation);
      }

      return {
        statusCode: 201,
        message: '공연이 등록되었습니다.',
        name,
        description,
        image,
        category_id,
        date,
        venue_id,
        hall_name,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** 공연 홀 예약 함수
   *
   */
  async postHallreservation(hall_id: number, schedule_id: number) {
    try {
      const findHall = await this.hallRepository.findOne({
        where: { id: hall_id },
      });
      if (!findHall) {
        throw new BadRequestException('해당 공연 홀이 존재하지 않습니다.');
      }

      const findSchedule = await this.scheduleRepository.findOne({
        where: { id: schedule_id },
      });
      if (!findSchedule) {
        throw new BadRequestException('해당 공연 스케쥴이 존재하지 않습니다.');
      }

      const newHallReservation = this.hallReservationRepository.create({
        hall: findHall,
        schedule: findSchedule,
      });
      await this.hallReservationRepository.save(newHallReservation);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** 좌석 저장 함수
   *
   * @param hall_id
   * @param capacity
   * @param capacity_group_by_grade
   * @returns
   */
  async postSeat(hall_id: number, class_id: number, concert_id: number) {
    try {
      const findHall = await this.hallRepository.findOne({
        where: { id: hall_id },
      });
      if (!findHall) {
        throw new BadRequestException('해당 공연 홀이 존재하지 않습니다.');
      }

      const findClass = await this.classRepository.findOne({
        where: { id: class_id },
        relations: ['concert'], //concert 정보 불러옴
      });
      if (!findClass) {
        throw new BadRequestException('해당 좌석 등급이 존재하지 않습니다.');
      }
      if (findClass.concert.id !== concert_id) {
        throw new BadRequestException(
          '해당 콘서트에 있는 좌석 등급이 아닙니다.',
        );
      }
      const newSeat = this.seatRepository.create({
        hall: findHall,
        class: findClass,
      });
      return await this.seatRepository.save(newSeat);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**등급 저장 함수
   *
   * @param concert_id
   * @param price_by_grade
   * @returns
   */
  async postClass(
    concert_id: number,
    price_by_grade: [{ grade: number; price: number }],
  ) {
    try {
      const findConcert = await this.concertRepository.findOne({
        where: { id: concert_id },
      });

      if (!findConcert) {
        throw new BadRequestException('해당 공연이 존재하지 않습니다.');
      }

      for (const priceAndGrade of price_by_grade) {
        const newClass = this.classRepository.create({
          concert: findConcert,
          price: priceAndGrade.price,
          grade: priceAndGrade.grade,
        });
        await this.classRepository.save(newClass);
      }

      return {
        statusCode: 201,
        message: '좌석등급이 등록되었습니다.',
        concert_id,
        price_by_grade,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
