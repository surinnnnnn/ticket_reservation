import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Schedule } from './schedules.entity';
import { Hall } from './hall.entity';
import { Seat } from './seat.entity';

@Entity({
  name: 'hall_reservations',
})
export class HallReservation {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Schedule, (schedule) => schedule.hallReservations)
  @JoinColumn({ name: 'schedule_id', referencedColumnName: 'id' })
  schedule: Schedule;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Hall, (hall) => hall.hallReservations)
  @JoinColumn({ name: 'halll_id', referencedColumnName: 'id' })
  hall: Hall;

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(() => Seat, (seats) => seats.hallReservation)
  seats: Seat;
}
