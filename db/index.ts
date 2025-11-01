import { drizzle } from 'drizzle-orm/neon-http';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!) as NeonQueryFunction<boolean, boolean>;
export const db = drizzle(sql, { schema });
