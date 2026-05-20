import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import type { AppEnv } from '../../config/env.schema';
import type { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService<AppEnv, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID', { infer: true }) ?? '',
      clientSecret: config.get('GOOGLE_CLIENT_SECRET', { infer: true }) ?? '',
      callbackURL: config.get('GOOGLE_CALLBACK_URL', { infer: true }) ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; emails?: { value: string }[]; displayName: string },
    done: VerifyCallback,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new UnauthorizedException('No email from Google profile'));
      return null as unknown as User;
    }

    try {
      const user = await this.usersService.findOrCreateByGoogle(
        profile.id,
        email,
        profile.displayName,
      );
      done(null, user);
      return user;
    } catch {
      done(new UnauthorizedException('OAuth validation failed'));
      return null as unknown as User;
    }
  }
}
