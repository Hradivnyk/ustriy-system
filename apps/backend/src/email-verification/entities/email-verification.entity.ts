import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  residentId!: string;

  @Column()
  code!: string;

  @Column()
  expiresAt!: Date;

  @Column({ default: false })
  isUsed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
