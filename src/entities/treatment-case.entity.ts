import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';
import { CaseStatus, PayerType } from '../common/enums.js';

@Entity('treatment_cases')
export class TreatmentCase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appointmentId: number;

  @Column()
  patientId: number;

  @Column()
  patientName: string;

  @Column()
  doctorId: number;

  @Column()
  doctorName: string;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'enum', enum: PayerType })
  payerType: PayerType;

  @Column()
  coverageRef: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  packageCode: string | null;

  @Column({ type: 'int' })
  estimatedCost: number;

  @Column({ type: 'boolean', default: false })
  isEmergency: boolean;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.REQUESTED })
  status: CaseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}