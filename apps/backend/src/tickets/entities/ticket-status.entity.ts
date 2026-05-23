import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ticket_statuses')
export class TicketStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;
}
