import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Payment } from '../../reservation/entities/payments.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    select: false,
    nullable: false,
  })
  card_number: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  card_hash: string;

  @Column({ type: 'varchar', length: 4, select: false, nullable: false })
  expiration_date: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: false })
  cvv: string;

  @ManyToOne(() => User, (user) => user.paymentMethod)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => Payment, (payments) => payments.paymentMethod)
  payments: Payment;
}
