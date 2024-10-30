import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
export class MakeReservationDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력하세요' })
  concert_name: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '공연 스케쥴 아이디를 입력하세요.' })
  schedule_id: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '죄석 번호를 입력하세요.' })
  seat_number: number;

  @IsNumber()
  @IsNotEmpty({ message: '결제 수단 아이디를 입력하세요.' })
  payment_method_id: number;
}
