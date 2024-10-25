import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ConcertCategory } from './concertCategory.enitity';
import { Schedule } from './schedules.entity';
import { Class } from './class.entity';
@Entity({
  name: 'concerts',
})
export class Concert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  image: string; //url 로 저장한다 가정

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(
    () => ConcertCategory,
    (concertCategories) => concertCategories.concert,
  )
  concertCategories: ConcertCategory[];

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(() => Schedule, (schedules) => schedules.concert)
  schedules: Schedule[];

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(() => Class, (classEntity) => classEntity.concert)
  classies: Class[];
}
