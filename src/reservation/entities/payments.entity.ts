import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { PaymentMethod } from '../../user/entities/paymentMethod.entity';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from './reservations.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  cost: number;

  @Column({
    type: 'enum',
    enum: ['결제 처리 중', '결제 완료', '결제 취소'],
    default: '결제 처리 중',
    nullable: false,
  })
  state: string;

  @Column({ type: 'int', nullable: false })
  approve_number: number;

  @Column({ type: 'timestamp', nullable: false })
  approvedAt: Date;

  // M : 1 결제 수단
  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.payments)
  @JoinColumn({ name: 'method_id', referencedColumnName: 'id' })
  paymentMethod: PaymentMethod;

  //M : 1 유저
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  //1 : 1 예약
  @OneToOne(() => Reservation, (reservation) => reservation.payment)
  reservation: Reservation;
}
