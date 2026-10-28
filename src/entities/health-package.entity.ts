import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('packages')
export class HealthPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  specialty: string;

  @Column({ type: 'int' })
  rate: number;

  @Column({ type: 'int' })
  expectedDays: number;
}