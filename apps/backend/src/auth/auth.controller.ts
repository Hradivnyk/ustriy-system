import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Next,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { AuthService } from './auth.service';
import { StaffResponseDto } from './dto/staff-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import type { AppEnv } from '../config/env.schema';
import type { Staff } from '../staff/entities/staff.entity';

interface RequestWithUser extends Request {
  user: Staff | { sub: string };
}

function resolveOAuthErrorCode(message?: string): string {
  if (!message) return 'oauth_failed';
  if (message.includes('not registered')) return 'not_registered';
  if (message.includes('inactive')) return 'inactive';
  if (message.includes('Access denied')) return 'access_denied';
  return 'oauth_failed';
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth consent screen' })
  googleAuth(): void {
    // Guard handles redirect
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true });

    passport.authenticate(
      'google',
      (err: Error | null, staff: Staff | null) => {
        if (err || !staff) {
          this.logger.error('Google OAuth failed', {
            error: err?.message ?? err,
            hasStaff: !!staff,
          });
          const errorCode = resolveOAuthErrorCode(err?.message);
          return res.redirect(`${frontendUrl}/auth/login?error=${errorCode}`);
        }
        const tokens = this.authService.generateTokens(staff.id);
        this.authService.setTokenCookies(res, tokens);
        res.redirect(`${frontendUrl}/dashboard`);
      },
    )(req, res, next);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh access token using refresh_token cookie' })
  refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): void {
    const payload = req.user as { sub: string };
    const tokens = this.authService.generateTokens(payload.sub);
    this.authService.setTokenCookies(res, tokens);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear auth cookies' })
  logout(@Res({ passthrough: true }) res: Response): void {
    this.authService.clearTokenCookies(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Return current authenticated staff member' })
  me(@Req() req: RequestWithUser): StaffResponseDto {
    return plainToInstance(StaffResponseDto, req.user, {
      excludeExtraneousValues: true,
    });
  }
}
