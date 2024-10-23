import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class PaymentMethodDto {
  @IsString()
  @Length(16, 16, {
    message: '16자리 숫자를 입력해주세요',
  })
  @IsNotEmpty({
    message: '특수 문자 제외 카드 번호 16자리 숫자를 입력해주세요.',
  })
  card_number: string;

  @IsString()
  @Length(4, 4, {
    message: '4자리 숫자를 입력해주세요',
  })
  @IsNotEmpty({
    message: '특수 문자 제외 카드 만료 년,월 숫자 4자리를 입력해주세요.',
  })
  expiration_date: string;

  @IsString()
  @Length(3, 3, {
    message: '3자리 숫자를 입력해주세요',
  })
  @IsNotEmpty({ message: '카드 뒷면 cvv 3자리 숫자를 입력해주세요.' })
  cvv: string;
}
