import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'streamoid',
  port: Number(process.env.PGPORT) || 5432,
});

export async function initDb() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      color TEXT,
      size TEXT,
      mrp NUMERIC(12,2) NOT NULL,
      price NUMERIC(12,2) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0
    );
  `;
  await pool.query(createTableSQL);
}
