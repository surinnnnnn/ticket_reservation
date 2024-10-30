import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Concert } from './concert.entity';
import { HallReservation } from './hallReservation.entity';

@Entity({
  name: 'schedules',
})
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: false })
  date: Date;
  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Concert, (concert) => concert.schedules)
  @JoinColumn({ name: 'concert_id', referencedColumnName: 'id' })
  concert: Concert;

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(
    () => HallReservation,
    (hallReservation) => hallReservation.schedule,
  )
  hallReservations: HallReservation[];
}
