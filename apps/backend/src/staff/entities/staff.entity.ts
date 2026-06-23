import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Specialist } from '../../tickets/entities/specialist.entity';

export enum StaffRole {
  SPECIALIST = 'specialist',
  DISPATCHER = 'dispatcher',
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  googleId!: string | null;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'enum', enum: StaffRole })
  role!: StaffRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'int', nullable: true })
  specialistId!: number | null;

  @ManyToOne(() => Specialist, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'specialistId' })
  specialist!: Specialist | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
