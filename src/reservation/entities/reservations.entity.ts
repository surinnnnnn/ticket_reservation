import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Payment } from './payments.entity';
import { Seat } from 'src/admin/entities/seat.entity';
import { Concert } from 'src/admin/entities/concert.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  // 1 : 1 좌석
  @OneToOne(() => Seat, (seat) => seat.reservation)
  @JoinColumn({ name: 'seat_id', referencedColumnName: 'id' })
  seat: Seat;

  // 1 : 1 결제
  @ManyToOne(() => Payment, (payment) => payment.reservation)
  @JoinColumn({ name: 'payment_id', referencedColumnName: 'id' })
  payment: Payment;

  //M : 1 공연
  @OneToOne(() => Concert, (concert) => concert.reservations)
  concert: Concert;
}
