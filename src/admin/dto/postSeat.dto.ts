import { IsNotEmpty, IsNumber } from 'class-validator';

export class PostSeatDto {
  @IsNumber()
  @IsNotEmpty({ message: '공연 홀 예약번호를 입력하세요.' })
  hall_reservation_id: number;

  @IsNumber()
  @IsNotEmpty({ message: '콘서트 아이디를 입력해주세요.' })
  concert_id: number;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 번호를 입력해주세요.' })
  number: number;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 등급 아이디를 입력해주세요.' })
  class_id: number;
}
