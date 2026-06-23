import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Specialist } from './specialist.entity';
import { TicketStatus } from './ticket-status.entity';
import { Dormitory } from '../../dormitories/entities/dormitory.entity';
import { Resident } from '../../residents/entities/resident.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Generated('increment')
  ticketNumber!: number;

  @Column()
  residentId!: string;

  @ManyToOne(() => Resident, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'residentId' })
  resident!: Resident;

  @Column()
  specialistId!: number;

  @ManyToOne(() => Specialist, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'specialistId' })
  specialist!: Specialist;

  @Column()
  statusId!: number;

  @ManyToOne(() => TicketStatus, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'statusId' })
  status!: TicketStatus;

  @Column()
  dormitoryId!: number;

  @ManyToOne(() => Dormitory, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'dormitoryId' })
  dormitory!: Dormitory;

  @Column('text')
  description!: string;

  @Column({ type: 'int', nullable: true })
  rating!: number | null;

  @Column({ type: 'uuid', nullable: true })
  assigneeId!: string | null;

  @ManyToOne(() => Staff, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigneeId' })
  assignee!: Staff | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
