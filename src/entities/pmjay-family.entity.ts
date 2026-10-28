import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pmjay_families')
export class PmjayFamily {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  familyId: string;

  @Column()
  headName: string;

  @Column({ type: 'int', default: 500000 })
  annualLimit: number;

  @Column({ type: 'int', default: 0 })
  usedAmount: number;

  @Column({ type: 'int' })
  year: number;
}