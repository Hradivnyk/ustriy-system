import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Staff, StaffRole } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  findAll(specialistId?: number): Promise<Staff[]> {
    return this.staffRepository.find({
      where: {
        isActive: true,
        role: StaffRole.SPECIALIST,
        ...(specialistId !== undefined ? { specialistId } : {}),
      },
      relations: { specialist: true },
      order: { name: 'ASC' },
    });
  }

  findById(id: string): Promise<Staff | null> {
    return this.staffRepository.findOneBy({ id });
  }

  findByGoogleId(googleId: string): Promise<Staff | null> {
    return this.staffRepository.findOneBy({ googleId });
  }

  findByEmail(email: string): Promise<Staff | null> {
    return this.staffRepository.findOneBy({ email: ILike(email) });
  }

  async linkGoogleId(staff: Staff, googleId: string): Promise<Staff> {
    staff.googleId = googleId;
    return this.staffRepository.save(staff);
  }
}
