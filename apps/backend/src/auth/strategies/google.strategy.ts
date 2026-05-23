import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import type { AppEnv } from '../../config/env.schema';
import type { Staff } from '../../staff/entities/staff.entity';
import { StaffService } from '../../staff/staff.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService<AppEnv, true>,
    private readonly staffService: StaffService,
  ) {
    super({
      clientID:
        config.get('GOOGLE_CLIENT_ID', { infer: true }) ?? 'not-configured',
      clientSecret:
        config.get('GOOGLE_CLIENT_SECRET', { infer: true }) ?? 'not-configured',
      callbackURL:
        config.get('GOOGLE_CALLBACK_URL', { infer: true }) ??
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      state: false,
    });
  }

  override authorizationParams(options: object): object {
    return { ...super.authorizationParams(options), prompt: 'select_account' };
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; emails?: { value: string }[]; displayName: string },
  ): Promise<Staff> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('No email from Google profile');
    }

    let staff = await this.staffService.findByGoogleId(profile.id);

    if (!staff) {
      staff = await this.staffService.findByEmail(email);
      if (!staff) {
        throw new UnauthorizedException(
          'Account not registered. Contact the dispatcher.',
        );
      }
      staff = await this.staffService.linkGoogleId(staff, profile.id);
    }

    if (!staff.isActive) {
      throw new UnauthorizedException('Account is inactive.');
    }

    return staff;
  }
}
