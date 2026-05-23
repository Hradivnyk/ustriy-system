import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';

import type { AppEnv } from '../../config/env.schema';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const token: string | undefined = req.cookies?.refresh_token as
      | string
      | undefined;

    if (!token) {
      this.clearCookies(res);
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      });
      req.user = payload;
      return true;
    } catch {
      this.clearCookies(res);
      throw new UnauthorizedException();
    }
  }

  private clearCookies(res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
  }
}
