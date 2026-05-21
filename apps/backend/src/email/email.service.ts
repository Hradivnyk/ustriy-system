import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import type { AppEnv } from '../config/env.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService<AppEnv, true>) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST', { infer: true }),
      port: this.config.get('MAIL_PORT', { infer: true }),
      auth: {
        user: this.config.get('MAIL_USER', { infer: true }),
        pass: this.config.get('MAIL_PASS', { infer: true }),
      },
    });
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const from = this.config.get('MAIL_FROM', { infer: true });
    await this.transporter.sendMail({
      from,
      to,
      subject: 'Код верифікації — Ustriy',
      text: `Ваш код верифікації: ${code}\n\nВін дійсний 10 хвилин.`,
    });
    this.logger.log(`Verification code sent to ${to}`);
  }
}
