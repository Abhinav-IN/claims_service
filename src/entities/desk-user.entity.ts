import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../common/enums.js';

@Entity('desk_users')
export class DeskUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userName: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;
}