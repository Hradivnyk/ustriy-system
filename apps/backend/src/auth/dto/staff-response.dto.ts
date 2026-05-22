import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { StaffRole } from '../../staff/entities/staff.entity';

export class StaffResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiProperty({ enum: StaffRole })
  @Expose()
  role!: StaffRole;
}
