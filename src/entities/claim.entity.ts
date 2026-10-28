import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,} from 'typeorm';
import { TreatmentCase } from './treatment-case.entity.js';
import { ClaimStatus } from '../common/enums/claims.enums.js';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  caseId: number;

  @OneToOne(() => TreatmentCase)
  @JoinColumn({ name: 'caseId' })
  case: TreatmentCase;

  @Column({ type: 'int' })
  finalBill: number;

  @Column({ type: 'int', default: 0 })
  nonPayableAmount: number;

  @Column({ type: 'int' })
  payerAmount: number;

  @Column({ type: 'int' })
  patientAmount: number;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.SUBMITTED })
  status: ClaimStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  settledAt: Date | null;
}