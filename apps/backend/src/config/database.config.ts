import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import type { AppEnv } from './env.schema';

export function createDatabaseConfig(
  config: ConfigService<AppEnv, true>,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get('DB_HOST', { infer: true }),
    port: config.get('DB_PORT', { infer: true }),
    database: config.get('DB_NAME', { infer: true }),
    username: config.get('DB_USERNAME', { infer: true }),
    password: config.get('DB_PASSWORD', { infer: true }),
    ssl: config.get('DB_SSL', { infer: true })
      ? { rejectUnauthorized: false }
      : false,
    autoLoadEntities: true,
    synchronize: config.get('TYPEORM_SYNCHRONIZE', { infer: true }),
    logging: config.get('TYPEORM_LOGGING', { infer: true }),
  };
}
