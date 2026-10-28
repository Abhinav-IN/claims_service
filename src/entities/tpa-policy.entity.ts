import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tpa_policies')
export class TpaPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  policyNo: string;

  @Column()
  holderName: string;

  @Column()
  insurerName: string;

  @Column()
  tpaName: string;

  @Column({ type: 'int' })
  sumInsured: number;

  @Column({ type: 'int' })
  balance: number;

  @Column({ type: 'int', default: 0 })
  coPayPercent: number;

  @Column({ type: 'date' })
  validFrom: string;

  @Column({ type: 'date' })
  validTill: string;
}