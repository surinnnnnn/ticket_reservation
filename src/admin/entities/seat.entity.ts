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

import { Class } from './class.entity';
import { isString } from 'lodash';
import { HallReservation } from './hallReservation.entity';

@Entity({
  name: 'seats',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['예약 중', '예약 전'], default: '예약 전' })
  state: string;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => HallReservation, (hallReservation) => hallReservation.seats)
  @JoinColumn({ name: 'hall_Reservation_id', referencedColumnName: 'id' })
  hallReservation: HallReservation;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Class, (classEntity) => classEntity.seats)
  @JoinColumn({ name: 'class_id', referencedColumnName: 'id' })
  class: Class;

  // 추후 reservation 연결
  //   /**
  //    * 1 : 1 관계 설정
  //    * @OneToOne
  //    */
  //   @OneToOne(() => Class, (classEntity) => classEntity.seat)
  //   @JoinColumn({ name: 'class_id', referencedColumnName: 'id' })
  //   class: Class;
}
