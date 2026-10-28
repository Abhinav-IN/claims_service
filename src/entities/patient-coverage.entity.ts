import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PayerType } from '../common/enums/claims.enums.js';

@Entity('patient_coverage')
export class PatientCoverage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  patientId: number;

  @Column({ type: 'enum', enum: PayerType })
  coverageType: PayerType;

  // TPA policy_no or Ayushman card_no
  @Column()
  coverageRef: string;

  @CreateDateColumn()
  createdAt: Date;
}