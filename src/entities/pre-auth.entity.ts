import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';
import { TreatmentCase } from './treatment-case.entity.js';
import { PreauthStatus } from '../common/enums.js';

@Entity('preauths')
export class Preauth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  caseId: number;

  @OneToOne(() => TreatmentCase)
  @JoinColumn({ name: 'caseId' })
  case: TreatmentCase;

  @Column({ type: 'enum', enum: PreauthStatus, default: PreauthStatus.SUBMITTED })
  status: PreauthStatus;

  @Column({ type: 'int' })
  requestedAmount: number;

  @Column({ type: 'int', nullable: true })
  approvedAmount: number | null;

  @Column({ type: 'text', nullable: true })
  deskRemarks: string | null;

  @Column({ type: 'text', nullable: true })
  hospitalReply: string | null;

  // only for emergency cases: deadline for post-approval
  @Column({ type: 'datetime', nullable: true })
  postApprovalDue: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}