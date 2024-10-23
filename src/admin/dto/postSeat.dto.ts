import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsObject,
} from 'class-validator';

export class PostSeatDto {
  @IsNumber()
  @IsNotEmpty({ message: '공연 홀 아이디를 입력하세요.' })
  hall_id: number;

  @IsNumber()
  @IsNotEmpty({ message: '총 좌석 수 를 입력하세요' })
  capacity: number;

  @IsObject()
  @IsNotEmpty({ message: '좌석 등급 아이디 별 좌석 수를 입력하세요' })
  capacity_group_by_grade: { [key: number]: number };
}
