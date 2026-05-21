import { Injectable } from '@nestjs/common';

import { EmailVerificationService } from '../../email-verification/email-verification.service';
import { ResidentType } from '../../residents/entities/resident-profile.entity';
import { ResidentsService } from '../../residents/residents.service';

export interface TenantRegistrationData {
  telegramId: string;
  name: string;
  dormitoryId: number;
  roomNumber: string;
}

export interface StudentRegistrationData extends TenantRegistrationData {
  email: string;
}

@Injectable()
export class RegistrationService {
  constructor(
    private readonly residentsService: ResidentsService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async initiateTenantRegistration(
    data: TenantRegistrationData,
  ): Promise<void> {
    await this.residentsService.createResident({
      ...data,
      residentType: ResidentType.TENANT,
    });
  }

  async initiateStudentRegistration(
    data: StudentRegistrationData,
  ): Promise<string> {
    const { resident } = await this.residentsService.createResident({
      ...data,
      residentType: ResidentType.STUDENT,
    });
    await this.emailVerificationService.createAndSend(resident.id, data.email);
    return resident.id;
  }

  async confirmStudentEmail(
    residentId: string,
    code: string,
  ): Promise<'ok' | 'invalid' | 'expired'> {
    const result = await this.emailVerificationService.verify(residentId, code);
    if (result === 'ok') {
      await this.residentsService.markResidentVerified(residentId);
    }
    return result;
  }
}
