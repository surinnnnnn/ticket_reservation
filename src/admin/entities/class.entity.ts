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

import { Seat } from './seat.entity';
import { Concert } from './concert.entity';

@Entity({
  name: 'classies',
})
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Concert, (concert) => concert.classies)
  @JoinColumn({ name: 'concert_id', referencedColumnName: 'id' })
  concert: Concert;

  /**
   * 1 : 1 관계 설정
   * @OneToOne
   */
  @OneToOne(() => Seat, (seat) => seat.class)
  @JoinColumn({ name: 'seat_id', referencedColumnName: 'id' })
  seat: Seat;
}
