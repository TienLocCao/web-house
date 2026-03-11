import { NextRequest, NextResponse } from 'next/server';
import { destroyUserSession } from '@/lib/user-auth';

export async function POST(request: NextRequest) {
  try {
    await destroyUserSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}