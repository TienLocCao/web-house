import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from './validation';

export async function requireUserAuth(request: NextRequest): Promise<NextResponse | null> {
  const user = await validateUserSession();

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return null; // Continue to the route
}

export function hasUserRole(user: any, role?: string): boolean {
  // For now, all authenticated users have the same role
  // Can be extended later for different user roles
  return !!user;
}