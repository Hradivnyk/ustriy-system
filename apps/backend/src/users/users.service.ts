import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOrCreateByGoogle(
    googleId: string,
    email: string,
    name: string,
  ): Promise<User> {
    const existing = await this.usersRepository.findOneBy({ googleId });
    if (existing) return existing;

    const user = this.usersRepository.create({ googleId, email, name });
    return this.usersRepository.save(user);
  }
}
