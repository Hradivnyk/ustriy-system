import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Specialist } from './specialist.entity';
import { TicketStatus } from './ticket-status.entity';
import { Dormitory } from '../../dormitories/entities/dormitory.entity';
import { Resident } from '../../residents/entities/resident.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
