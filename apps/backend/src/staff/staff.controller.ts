import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetStaffFilterDto } from './dto/get-staff-filter.dto';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('staff')
@UseGuards(JwtAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @ApiOperation({
    summary: 'Список активних фахівців з фільтрацією за спеціалізацією',
  })
  @Get()
  findAll(@Query() filter: GetStaffFilterDto) {
    return this.staffService.findAll(filter.specialistId);
  }
}
