import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Staff } from './entities/staff.entity';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [StaffService, JwtAuthGuard],
  controllers: [StaffController],
  exports: [StaffService],
})
export class StaffModule {}
