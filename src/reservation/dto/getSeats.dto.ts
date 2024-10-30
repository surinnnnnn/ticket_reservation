import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
export class GetSeatsDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력하세요' })
  concert_name: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '공연 스케쥴 아이디를 입력하세요.' })
  schedule_id: number;
}
