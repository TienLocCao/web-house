import { User, UserSession } from './types';
import { getUserSession } from './session';
import { sql } from '../db/client';

export async function validateUserSession(): Promise<User | null> {
  const session = await getUserSession();
  if (!session) return null;

  const result = await sql`
    SELECT * FROM users WHERE id = ${session.user_id} AND is_active = true
  `;

  return result[0] as User || null;
}

export async function validateUserSessionFromRequest(request: Request): Promise<User | null> {
  // For API routes, we can get session from cookies
  return validateUserSession();
}

export async function validateUserForLogin(email: string, password: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} AND is_active = true
  `;

  const user = result[0];
  if (!user) return null;

  const bcrypt = await import('bcryptjs');
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;

  return user as User;
}