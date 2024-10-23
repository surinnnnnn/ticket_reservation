import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(6, 12, {
    message: '아이디 길이는 6자 이상이어야하며, 12자를 초과할 수 없습니다.',
  })
  @Matches(/^[a-zA-Z0-9!@#$]*$/, {
    message:
      '아이디로 영문, 숫자, 일부 특수 문자(!,@,#,$,)만 사용할 수 있습니다.',
  })
  @IsNotEmpty({ message: '계정 아이디를 입력해주세요' })
  account_id: string;

  @IsString()
  @Length(8, 16, {
    message: '비밀번호 길이는 8자 이상이어야하며, 16자를 초과를할 수 없습니다.',
  })
  @Matches(/^[a-zA-Z0-9!@#$]*$/, {
    message:
      '비밀번호로 영문, 숫자, 일부 특수 문자(!,@,#,$,)만 사용할 수 있습니다.',
  })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '확인 비밀번호를 입력해주세요.' })
  confirmed_password: string;

  @IsString()
  @IsNotEmpty({ message: '별명을 입력해주세요.' })
  nickname: string;

  @IsOptional()
  @IsString()
  admin_number: string;
}
