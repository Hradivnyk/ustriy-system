import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import type { AppEnv } from '../config/env.schema';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import type { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User | { sub: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
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

    passport.authenticate('google', (err: Error | null, user: User | null) => {
      if (err || !user) {
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }
      const tokens = this.authService.generateTokens(user.id);
      this.authService.setTokenCookies(res, tokens);
      res.redirect(`${frontendUrl}/auth/callback?success=true`);
    })(req, res, next);
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
  @ApiOperation({ summary: 'Return current authenticated user' })
  me(@Req() req: RequestWithUser): UserResponseDto {
    return plainToInstance(UserResponseDto, req.user, {
      excludeExtraneousValues: true,
    });
  }
}
