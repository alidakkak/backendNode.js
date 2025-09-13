import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET is too short'),
  DATABASE_URL: z.string(),
  SUB_DURATION_DAYS: z.coerce.number().default(30),
});

export const env = envSchema.parse(process.env);
