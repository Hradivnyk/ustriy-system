import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

import type { AppEnv } from '../config/env.schema';

const IS_PROD = process.env.NODE_ENV === 'production';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET', { infer: true }),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', { infer: true }),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', { infer: true }),
    });

    return { accessToken, refreshToken };
  }

  setTokenCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ): void {
    const base = { httpOnly: true, secure: IS_PROD, sameSite: 'lax' as const };

    res.cookie('access_token', tokens.accessToken, {
      ...base,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...base,
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearTokenCookies(res: Response): void {
    res.cookie('access_token', '', { httpOnly: true, maxAge: 0, path: '/' });
    res.cookie('refresh_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/api/auth/refresh',
    });
  }
}
