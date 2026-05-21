import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DormitoriesService } from './dormitory.service';
import { Dormitory } from './entities/dormitory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dormitory])],
  providers: [DormitoriesService],
  exports: [DormitoriesService],
})
export class DormitoriesModule {}
