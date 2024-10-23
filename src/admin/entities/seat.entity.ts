import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Hall } from './hall.entity';
import { Class } from './class.entity';

@Entity({
  name: 'seats',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Hall, (hall) => hall.seat)
  @JoinColumn({ name: 'hall_id', referencedColumnName: 'id' })
  hall: Hall;

  /**
   * 1 : 1 관계 설정
   * @OneToOne
   */
  @OneToOne(() => Class, (classEntity) => classEntity.seat)
  @JoinColumn({ name: 'class_id', referencedColumnName: 'id' })
  class: Class;

  // 추후 reservation 연결
  //   /**
  //    * 1 : M 관계 설정
  //    * @OneToOne
  //    */
  //   @OneToOne(() => Class, (classEntity) => classEntity.seat)
  //   @JoinColumn({ name: 'class_id', referencedColumnName: 'id' })
  //   class: Class;
}
