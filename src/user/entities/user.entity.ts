import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Role } from '../types/userRole.type';

@Index('account_id', ['account_id'], { unique: true }) //@index(인덱스명, [인덱스 지정할 컬럼명])
@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  account_id: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  nickname: string;

  @Column({ type: 'enum', enum: Role, default: Role.User }) //기본 타입 유저
  role: Role;
}
