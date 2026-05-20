import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.resolve(exception, request.url);

    response.status(status).json(body);
  }

  private resolve(
    exception: unknown,
    path: string,
  ): { status: number; body: object } {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const body =
        typeof exceptionResponse === 'object'
          ? { ...(exceptionResponse as object), timestamp, path }
          : { statusCode: status, message: exceptionResponse, timestamp, path };

      if (status >= 500) {
        this.logger.error(`${status} ${path}`, exception.stack);
      }

      return { status, body };
    }

    this.logger.error(
      exception instanceof Error ? exception.message : String(exception),
      exception instanceof Error ? exception.stack : undefined,
    );

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp,
        path,
      },
    };
  }
}
