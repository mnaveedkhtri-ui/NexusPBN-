import { sql } from '@vercel/postgres';

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY, 
      email VARCHAR(255) UNIQUE, 
      password VARCHAR(255), 
      name VARCHAR(255), 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(255) PRIMARY KEY,
      domain VARCHAR(255) NOT NULL,
      moneyUrl VARCHAR(255) NOT NULL,
      anchorText VARCHAR(255) NOT NULL,
      vercelUrl VARCHAR(255),
      githubRepo VARCHAR(255),
      status VARCHAR(50) DEFAULT 'live',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export default sql;
