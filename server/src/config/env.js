import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  
  // Database configuration
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().default('kannur_rd_db'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_POOL_MAX: z.coerce.number().default(20),
  DB_POOL_MIN: z.coerce.number().default(5),

  // Authentication secrets
  JWT_ACCESS_SECRET: z.string().default('kannur_university_rd_cell_access_secret_2026'),
  JWT_REFRESH_SECRET: z.string().default('kannur_university_rd_cell_refresh_secret_2026'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Client CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Uploads directory
  UPLOAD_DIR: z.string().default('./data/uploads'),
});

const parsedEnv = envSchema.safeParse({
  ...process.env,
  DB_HOST: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  DB_NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || 'kannur_rd_db',
  DB_USER: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || ''),
});

if (!parsedEnv.success) {
  console.error('CRITICAL: Environment validation failure. Server cannot boot:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;

