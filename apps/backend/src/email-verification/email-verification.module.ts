import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailVerificationService } from './email-verification.service';
import { EmailVerification } from './entities/email-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification])],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
