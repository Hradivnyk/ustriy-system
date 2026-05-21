import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Dormitory } from './entities/dormitory.entity';

const DORMITORY_NUMBERS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

@Injectable()
export class DormitoriesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Dormitory)
    private readonly dormitoryRepository: Repository<Dormitory>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaults();
  }

  async findAll(): Promise<Dormitory[]> {
    return this.dormitoryRepository.find({
      where: { isActive: true },
      order: { number: 'ASC' },
    });
  }

  async findById(id: number): Promise<Dormitory | null> {
    return this.dormitoryRepository.findOne({ where: { id, isActive: true } });
  }

  async findByNumber(number: number): Promise<Dormitory | null> {
    return this.dormitoryRepository.findOne({
      where: { number, isActive: true },
    });
  }

  private async seedDefaults(): Promise<void> {
    for (const number of DORMITORY_NUMBERS) {
      await this.dormitoryRepository
        .createQueryBuilder()
        .insert()
        .into(Dormitory)
        .values({ number, isActive: true })
        .orIgnore()
        .execute();
    }
  }
}
