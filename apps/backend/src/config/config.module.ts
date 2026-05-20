import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { type ZodIssue, ZodError } from 'zod';

import { envSchema } from './env.schema';

function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    throw new Error(`\nMissing or invalid environment variables:\n${errors}`);
  }

  return result.data;
}

function formatZodErrors(error: ZodError): string {
  return error.issues
    .map((e: ZodIssue) => `  [${e.path.join('.') || 'root'}] ${e.message}`)
    .join('\n');
}

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
