import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class PostConcertDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력해주세요' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '공연 설명을 입력해주세요.' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: '이미지 url을 입력해주세요.' })
  image: string;

  @IsNumber()
  @IsNotEmpty({ message: '카테고리 아이디를 입력하세요' })
  category_id: number;

  @IsArray()
  @IsNotEmpty({ message: '공연 날짜와 시간을 입력하세요.' })
  @IsString({ each: true, message: '유효한 날짜 형식이 아닙니다.' })
  date: string[];

  @IsString()
  @IsNotEmpty({ message: '공연 홀 이름을 입력하세요' })
  hall_name: string;

  @IsNumber()
  @IsNotEmpty({ message: '공연장 아이디를 입력하세요' })
  venue_id: number;
}
