import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsObject,
  IsArray,
} from 'class-validator';

export class GetDetailsDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력하세요' })
  concert_name: string;
}
