import { sql } from '@vercel/postgres';

// We can expose an init function to ensure the table is created.
export async function initDB() {
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
