import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      
      user: process.env.DB_USER || 'postgres',
      
      password: process.env.DB_PASS || 'postgres123',
      
      database: process.env.DB_NAME || 'carritoloco',
      port: Number(process.env.DB_PORT) || 5432,
      
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default { query, getPool };