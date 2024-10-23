import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { HallReservation } from './hallReservation.entity';
import { Seat } from './seat.entity';

@Entity({
  name: 'halls',
})
export class Hall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', select: false, nullable: false })
  venue_id: number;

  @Column({ type: 'varchar', select: false, nullable: false })
  name: string;

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(() => HallReservation, (hallRrservation) => hallRrservation.hall)
  hallRrservations: HallReservation[];

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(() => Seat, (seat) => seat.hall)
  seat: Seat[];
}
