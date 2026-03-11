import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { USER_AUTH_CONFIG } from './config';
import { UserSession } from './types';
import { sql } from '../db/client';

const SESSION_COOKIE_NAME = 'user_session';

export async function createUserSession(userId: number): Promise<string> {
  const sessionId = nanoid();
  const expiresAt = new Date(Date.now() + USER_AUTH_CONFIG.SESSION_DURATION);

  await sql`INSERT INTO user_sessions (id, user_id, expires_at) VALUES (${sessionId}, ${userId}, ${expiresAt})`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });

  return sessionId;
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) return null;

  const result = await sql`
    SELECT * FROM user_sessions WHERE id = ${sessionId} AND expires_at > NOW()
  `;

  return result[0] as UserSession || null;
}

export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await sql`DELETE FROM user_sessions WHERE id = ${sessionId}`;
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function refreshUserSession(): Promise<void> {
  const session = await getUserSession();
  if (!session) return;

  const newExpiresAt = new Date(Date.now() + USER_AUTH_CONFIG.SESSION_DURATION);

  await sql`UPDATE user_sessions SET expires_at = ${newExpiresAt} WHERE id = ${session.id}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: newExpiresAt,
  });
}