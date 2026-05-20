import * as path from 'path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  logging: process.env.TYPEORM_LOGGING === 'true',
});
