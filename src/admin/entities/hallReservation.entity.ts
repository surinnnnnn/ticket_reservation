import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Schedule } from './schedules.entity';
import { Hall } from './hall.entity';

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
  @ManyToOne(() => Schedule, (schedule) => schedule.hallRrservations)
  @JoinColumn({ name: 'schedule_id', referencedColumnName: 'id' })
  schedule: Schedule;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Hall, (hall) => hall.hallRrservations)
  @JoinColumn({ name: 'halll_id', referencedColumnName: 'id' })
  hall: Hall;
}
