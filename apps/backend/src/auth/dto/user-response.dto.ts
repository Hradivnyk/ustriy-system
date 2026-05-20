import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { UserRole } from '../../users/entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiProperty({ enum: UserRole })
  @Expose()
  role!: UserRole;
}
