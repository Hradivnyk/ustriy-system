import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  RESIDENT = 'resident',
  SPECIALIST = 'specialist',
  DISPATCHER = 'dispatcher',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  googleId!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.RESIDENT })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
