import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmailService } from '../email/email.service';
import { EmailVerification } from './entities/email-verification.entity';

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_LENGTH = 6;

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly verificationRepository: Repository<EmailVerification>,
    private readonly emailService: EmailService,
  ) {}

  async createAndSend(residentId: string, email: string): Promise<void> {
    await this.verificationRepository.update(
      { residentId, isUsed: false },
      { isUsed: true },
    );

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await this.verificationRepository.save(
      this.verificationRepository.create({ residentId, code, expiresAt }),
    );

    await this.emailService.sendVerificationCode(email, code);
  }

  async verify(
    residentId: string,
    inputCode: string,
  ): Promise<'ok' | 'invalid' | 'expired'> {
    const record = await this.verificationRepository.findOne({
      where: { residentId, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!record) return 'invalid';
    if (new Date() > record.expiresAt) return 'expired';
    if (record.code !== inputCode.trim()) return 'invalid';

    await this.verificationRepository.update(record.id, { isUsed: true });
    return 'ok';
  }

  private generateCode(): string {
    const digits = Math.floor(Math.random() * 10 ** CODE_LENGTH);
    return digits.toString().padStart(CODE_LENGTH, '0');
  }
}
