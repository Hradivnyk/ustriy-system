import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specialists')
export class Specialist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ default: true })
  isActive!: boolean;
}
