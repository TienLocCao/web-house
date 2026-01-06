import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import type { AdminUser } from "./types"
import { AUTH_CONFIG } from "./config"

const { IDLE_TIMEOUT_MINUTES } = AUTH_CONFIG

/**
 * Validate session from NextRequest (for API routes and Edge runtime)
 */
export async function validateSessionFromRequest(
  req: NextRequest
): Promise<AdminUser | null> {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value
    if (!sessionToken) return null
    
    const [session] = await sql`
      SELECT
        s.id,
        s.admin_id,
        u.email,
        u.name,
        u.role,
        u.is_active
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.admin_id
      WHERE s.session_token = ${sessionToken}
        AND s.expires_at > NOW()
        AND s.last_activity_at > NOW() - (${IDLE_TIMEOUT_MINUTES} * INTERVAL '1 minute')
    `

    if (!session || !session.is_active) return null

    await sql`
      UPDATE admin_sessions
      SET last_activity_at = NOW()
      WHERE id = ${session.id}
    `

    return {
      id: session.admin_id,
      email: session.email,
      name: session.name,
      role: session.role,
      is_active: session.is_active,
    }
  } catch (err) {
    console.error("[validateSessionFromRequest]", err)
    return null
  }
}

/**
 * Validate session for login page (check if already logged in)
 */
export async function validateSessionForLogin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return null

  const [session] = await sql`
    SELECT 1
    FROM admin_sessions
    WHERE session_token = ${token}
      AND expires_at > NOW()
      AND last_activity_at > NOW() - (${IDLE_TIMEOUT_MINUTES} * INTERVAL '1 minute')
  `

  return session ?? null
}

/**
 * Validate session for server components
 */
export async function validateSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return null

  const [session] = await sql`
    SELECT
      s.id,
      s.admin_id,
      u.email,
      u.name,
      u.role,
      u.is_active
    FROM admin_sessions s
    JOIN admin_users u ON u.id = s.admin_id
    WHERE s.session_token = ${token}
      AND s.expires_at > NOW()
      AND s.last_activity_at > NOW() - (${IDLE_TIMEOUT_MINUTES} * INTERVAL '1 minute')
  `

  if (!session || !session.is_active) return null

  // ✅ CHỈ UPDATE KHI THỰC SỰ DÙNG HỆ THỐNG
  await sql`
    UPDATE admin_sessions
    SET last_activity_at = NOW()
    WHERE id = ${session.id}
  `

  return {
    id: session.admin_id,
    email: session.email,
    name: session.name,
    role: session.role,
    is_active: session.is_active,
  }
}
