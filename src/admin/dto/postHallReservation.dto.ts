import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsObject,
  IsArray,
} from 'class-validator';
import { isNumber } from 'lodash';

export class PostHallReservationDto {
  @IsNumber()
  @IsNotEmpty({ message: '공연 홀 예약 아이디를 입력하세요.' })
  hall_id: number;

  @IsNumber()
  @IsNotEmpty({ message: '공연 스케쥴 아이디를 입력하세요' })
  schedule_id: number;
}
