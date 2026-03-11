import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing file system...');
    const cwd = process.cwd();
    console.log('Current working directory:', cwd);

    const testFile = path.join(cwd, 'package.json');
    const exists = fs.existsSync(testFile);
    console.log('package.json exists:', exists);

    return NextResponse.json({
      success: true,
      cwd,
      packageExists: exists
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}