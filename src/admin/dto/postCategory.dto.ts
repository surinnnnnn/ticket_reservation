import { IsNotEmpty, IsString } from 'class-validator';

export class PostCategoryDto {
  @IsString()
  @IsNotEmpty({ message: '카테고리 명을 입력해주세요.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '카테고리 설명을 입력해주세요.' })
  description: string;
}
