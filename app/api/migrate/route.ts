import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Migration not allowed in production' },
        { status: 403 }
      );
    }

    console.log('Running database migration...');

    // Read the SQL file
    const sqlFile = path.join(process.cwd(), 'scripts', '01-create-tables.sql');
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

    return NextResponse.json({ success: true, message: 'Migration completed successfully!' });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}