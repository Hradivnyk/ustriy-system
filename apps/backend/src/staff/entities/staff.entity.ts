import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StaffRole {
  SPECIALIST = 'specialist',
  DISPATCHER = 'dispatcher',
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  googleId!: string | null;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'enum', enum: StaffRole })
  role!: StaffRole;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
