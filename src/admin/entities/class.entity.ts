import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Seat } from './seat.entity';
import { Concert } from './concert.entity';

@Entity({
  name: 'classies',
})
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, unique: true })
  grade: number;

  @Column({ type: 'int', nullable: false })
  price: number;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Concert, (concert) => concert.classies)
  @JoinColumn({ name: 'concert_id', referencedColumnName: 'id' })
  concert: Concert;

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToOne(() => Seat, (seat) => seat.class)
  seats: Seat[];
}
