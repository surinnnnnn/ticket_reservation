import { IsNotEmpty, IsNumber } from 'class-validator';
export class CancelDto {
  @IsNumber()
  @IsNotEmpty({ message: '예약 번호를 입력 하세요.' })
  reservation_number: number;

  @IsNumber()
  @IsNotEmpty({ message: '결제 수단 아이디를 입력하세요.' })
  payment_method_id: number;
}
