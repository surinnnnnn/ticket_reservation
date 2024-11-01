import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Class } from './class.entity';
import { HallReservation } from './hallReservation.entity';
import { Reservation } from '../../reservation/entities/reservations.entity';

@Entity({
  name: 'seats',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  number: number;

  @Column({
    type: 'enum',
    enum: ['예매 불가', '예매 가능'],
    default: '예매 가능',
  })
  state: string;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => HallReservation, (hallReservation) => hallReservation.seats)
  @JoinColumn({ name: 'hall_Reservation_id', referencedColumnName: 'id' })
  hallReservation: HallReservation;

  /**
   * m : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Class, (classEntity) => classEntity.seats)
  @JoinColumn({ name: 'class_id', referencedColumnName: 'id' })
  class: Class;

  /**
   * 1 : 1 관계 설정
   * @OneToOne
   */
  @OneToOne(() => Reservation, (reservation) => reservation.seat)
  reservation: Reservation;
}
