import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Concert } from './concert.entity';
import { Category } from './category.entity';

@Entity({
  name: 'concert_categories',
})
export class ConcertCategory {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Concert, (concert) => concert.concertCategories)
  @JoinColumn({ name: 'concert_id', referencedColumnName: 'id' })
  concert: Concert;

  /**
   * M : 1 관계 설정
   * @ManyToOne
   */
  @ManyToOne(() => Category, (category) => category.concertCategories)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category;
}
