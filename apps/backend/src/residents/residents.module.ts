import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResidentProfile } from './entities/resident-profile.entity';
import { Resident } from './entities/resident.entity';
import { ResidentsService } from './residents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resident, ResidentProfile])],
  providers: [ResidentsService],
  exports: [ResidentsService],
})
export class ResidentsModule {}
