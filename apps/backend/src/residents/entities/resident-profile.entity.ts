import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Resident } from './resident.entity';
import { Dormitory } from '../../dormitories/entities/dormitory.entity';

export enum ResidentType {
  STUDENT = 'student',
  TENANT = 'tenant',
}

@Entity('resident_profiles')
export class ResidentProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Resident, { onDelete: 'CASCADE' })
  @JoinColumn()
  resident!: Resident;

  @Column()
  residentId!: string;

  @ManyToOne(() => Dormitory, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn()
  dormitory!: Dormitory;

  @Column()
  dormitoryId!: number;

  @Column()
  roomNumber!: string;

  @Column({ type: 'enum', enum: ResidentType })
  residentType!: ResidentType;

  @Column({ default: false })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
