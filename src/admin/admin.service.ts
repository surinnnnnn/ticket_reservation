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
import { JwtService } from '@nestjs/jwt';
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

  //   async postSeat(
  //     hall_id: number,
  //     capacity: number,
  //     capacity_group_by_grade: object,
  //   ): Promise<Seat> {
  //     const newSeat = this.seatRepository.create({
  //       hall_id,
  //       capacity,
  //       capacity_group_by_grade,
  //     });
  //     return await this.seatRepository.save(newSeat);
  //   }

  //   async postClass(concert_id: number, price_by_grade: object): Promise<Class> {
  //     const newClass = this.classRepository.create({
  //       concert_id,
  //       price_by_grade,
  //     });
  //     return await this.classRepository.save(newClass);
  //   }
}
