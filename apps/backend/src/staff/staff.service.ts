import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  findById(id: string): Promise<Staff | null> {
    return this.staffRepository.findOneBy({ id });
  }

  findByGoogleId(googleId: string): Promise<Staff | null> {
    return this.staffRepository.findOneBy({ googleId });
  }

  findByEmail(email: string): Promise<Staff | null> {
    return this.staffRepository.findOneBy({ email });
  }

  async linkGoogleId(staff: Staff, googleId: string): Promise<Staff> {
    staff.googleId = googleId;
    return this.staffRepository.save(staff);
  }
}
