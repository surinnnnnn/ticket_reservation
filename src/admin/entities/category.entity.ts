import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConcertCategory } from './concertCategory.enitity';

@Entity({
  name: 'categories',
})
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  /**
   * 1 : M 관계 설정
   * @OneToMany
   */
  @OneToMany(
    () => ConcertCategory,
    (concertCategory) => concertCategory.category,
  )
  concertCategories: ConcertCategory[];
}
