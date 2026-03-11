import { config } from 'dotenv';
config({ path: '.env.local' });

// Set DATABASE_URL explicitly
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_otiGkxD0Vc2X@ep-cool-shape-a4r2daqh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

import { sql } from '../lib/db/client';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('Running database migration...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '01-create-tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sql.unsafe(statement);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();