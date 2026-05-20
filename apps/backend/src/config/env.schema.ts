import { z } from 'zod';

// z.coerce.boolean() treats any non-empty string as true — '0'/'false' become true.
// This helper correctly parses env string booleans.
const boolEnv = (
  defaultValue = false,
): z.ZodEffects<z.ZodBoolean, boolean, unknown> =>
  z.preprocess((val): boolean => {
    if (val === undefined || val === null) return defaultValue;
    if (typeof val === 'boolean') return val;
    const s = String(val);
    return s === 'true' || s === '1';
  }, z.boolean());

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_SSL: boolEnv(false),
  TYPEORM_SYNCHRONIZE: boolEnv(false),
  TYPEORM_LOGGING: boolEnv(false),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  TELEGRAM_BOT_TOKEN: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  FRONTEND_URL: z.string().url().default('http://localhost:3001'),

  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),

  SWAGGER_ENABLED: boolEnv(true),
  SWAGGER_PATH: z.string().default('api-docs'),
});

export type AppEnv = z.infer<typeof envSchema>;
