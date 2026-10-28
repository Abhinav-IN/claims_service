import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pmjay_members')
export class PmjayMember {
  @PrimaryGeneratedColumn()
  id: number;

  // matches PmjayFamily.familyId
  @Column()
  familyId: string;

  @Column()
  memberName: string;

  // under the assumption that each member has its own card no. but their family id is same.
  @Column({ unique: true })
  cardNo: string;

  @Column({ type: 'int' })
  age: number;
}