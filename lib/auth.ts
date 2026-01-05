import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { nanoid } from "nanoid"

/* =========================
 * TYPES
 * ========================= */
export interface AdminUser {
  id: number
  email: string
  name: string
  role: string
  is_active: boolean
}

/* =========================
 * CONSTANTS
 * ========================= */
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const IDLE_TIMEOUT_HOURS = 24

/* =========================
 * CREATE SESSION (Node only)
 * ========================= */
export async function createSession(
  adminId: number,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const sessionToken = nanoid(64)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await sql`
    INSERT INTO admin_sessions (
      admin_id,
      session_token,
      expires_at,
      ip_address,
      user_agent,
      last_activity_at
    )
    VALUES (
      ${adminId},
      ${sessionToken},
      ${expiresAt},
      ${ipAddress || null},
      ${userAgent || null},
      NOW()
    )
  `

  const isProd = process.env.NODE_ENV === "production"
  const cookieStore = await cookies()

  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionToken
}

/* =========================
 * EDGE + API VALIDATION
 * ========================= */
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
        AND s.last_activity_at > NOW() - INTERVAL '${IDLE_TIMEOUT_HOURS} hours'
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

/* =========================
 * SERVER COMPONENT VALIDATION
 * ========================= */
export async function validateSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value
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
        AND s.last_activity_at > NOW() - INTERVAL '${IDLE_TIMEOUT_HOURS} hours'
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
    console.error("[validateSession]", err)
    return null
  }
}

/* =========================
 * DESTROY SESSION
 * ========================= */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (sessionToken) {
      await sql`
        DELETE FROM admin_sessions
        WHERE session_token = ${sessionToken}
      `
    }

    cookieStore.delete("admin_session")
  } catch (err) {
    console.error("[destroySession]", err)
  }
}

/* =========================
 * REQUIRE AUTH / ROLE
 * ========================= */
export async function requireAuth(): Promise<AdminUser> {
  const admin = await validateSession()
  if (!admin) throw new Error("Unauthorized")
  return admin
}

export function requireRole(admin: AdminUser, roles: string[]) {
  if (!roles.includes(admin.role)) {
    throw new Error("Forbidden")
  }
}

export function hasRole(admin: AdminUser, roles: string[]) {
  return roles.includes(admin.role)
}
