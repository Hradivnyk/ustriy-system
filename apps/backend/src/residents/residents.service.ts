import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ResidentProfile,
  ResidentType,
} from './entities/resident-profile.entity';
import { Resident } from './entities/resident.entity';

export interface CreateResidentDto {
  telegramId: string;
  name: string;
  email?: string;
  residentType: ResidentType;
  dormitoryId: number;
  roomNumber: string;
}

export interface ResidentWithProfile {
  resident: Resident;
  profile: ResidentProfile | null;
}

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private readonly residentRepository: Repository<Resident>,
    @InjectRepository(ResidentProfile)
    private readonly profileRepository: Repository<ResidentProfile>,
  ) {}

  async findByTelegramId(telegramId: string): Promise<Resident | null> {
    return this.residentRepository.findOne({ where: { telegramId } });
  }

  async findByTelegramIdWithProfile(
    telegramId: string,
  ): Promise<ResidentWithProfile | null> {
    const resident = await this.residentRepository.findOne({
      where: { telegramId },
    });
    if (!resident) return null;

    const profile = await this.profileRepository.findOne({
      where: { residentId: resident.id },
    });

    return { resident, profile };
  }

  async findByEmail(email: string): Promise<Resident | null> {
    return this.residentRepository.findOne({ where: { email } });
  }

  async updateTelegramId(
    residentId: string,
    newTelegramId: string,
  ): Promise<void> {
    await this.residentRepository.update(residentId, {
      telegramId: newTelegramId,
    });
  }

  async createResident(
    dto: CreateResidentDto,
  ): Promise<{ resident: Resident; profile: ResidentProfile }> {
    const resident = this.residentRepository.create({
      telegramId: dto.telegramId,
      name: dto.name,
      email: dto.email,
      isActive: false,
    });
    const savedResident = await this.residentRepository.save(resident);

    const profile = this.profileRepository.create({
      residentId: savedResident.id,
      dormitoryId: dto.dormitoryId,
      roomNumber: dto.roomNumber,
      residentType: dto.residentType,
      isVerified: false,
    });
    const savedProfile = await this.profileRepository.save(profile);

    return { resident: savedResident, profile: savedProfile };
  }

  async markResidentVerified(residentId: string): Promise<void> {
    await this.residentRepository.update(residentId, { isActive: true });
    await this.profileRepository.update({ residentId }, { isVerified: true });
  }

  async updateName(residentId: string, name: string): Promise<void> {
    await this.residentRepository.update(residentId, { name });
  }

  async updateDormitory(
    residentId: string,
    dormitoryId: number,
  ): Promise<void> {
    await this.profileRepository.update({ residentId }, { dormitoryId });
  }

  async updateRoomNumber(
    residentId: string,
    roomNumber: string,
  ): Promise<void> {
    await this.profileRepository.update({ residentId }, { roomNumber });
  }
}
