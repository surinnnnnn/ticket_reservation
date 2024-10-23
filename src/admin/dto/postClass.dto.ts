import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsObject,
} from 'class-validator';

export class PostClassDto {
  @IsNumber()
  @IsNotEmpty({ message: '콘서트 아이디를 입력하세요' })
  concert_id: number;

  @IsObject()
  @IsNotEmpty({ message: '좌석 등급 아이디 별 좌석 가격을 입력하세요' })
  price_by_grade: { [key: number]: number };
}