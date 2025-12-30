import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

// Admin user type
export interface AdminUser {
  id: number
  email: string
  name: string
  role: string
  is_active: boolean
}

// Session type
interface AdminSession {
  id: number
  admin_id: number
  session_token: string
  expires_at: Date
}

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

/**
 * Create a new admin session
 */
export async function createSession(adminId: number, ipAddress?: string, userAgent?: string): Promise<string> {
  const sessionToken = nanoid(64)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await sql
    `
    INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
    VALUES (${adminId}, ${sessionToken}, ${expiresAt}, ${ipAddress || null}, ${userAgent || null})
  `
  const isProd = process.env.NODE_ENV === "production"
  // Set secure HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none": "lax",
    expires: expiresAt,
    // path: "/admin",
    path: "/",
  })

  return sessionToken
}

/**
 * Validate session and return admin user
 */
export async function validateSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return null
    }

    // Get session with admin user data
    const [session] = await sql`
      SELECT s.*, u.email, u.name, u.role, u.is_active
      FROM admin_sessions s
      JOIN admin_users u ON s.admin_id = u.id
      WHERE s.session_token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (!session) {
      // Invalid or expired session
      await destroySession()
      return null
    }

    const admin: AdminUser = {
      id: session.admin_id,
      email: (session as any).email,
      name: (session as any).name,
      role: (session as any).role,
      is_active: (session as any).is_active,
    }

    if (!admin.is_active) {
      await destroySession()
      return null
    }

    // Update last login
    await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${admin.id}`

    return admin
  } catch (error) {
    console.error("[v0] Session validation error:", error)
    return null
  }
}

/**
 * Destroy current session
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (sessionToken) {
      // Delete session from database
      await sql`DELETE FROM admin_sessions WHERE session_token = ${sessionToken}`
    }

    // Clear cookie
    cookieStore.delete("admin_session")
  } catch (error) {
    console.error("[v0] Session destruction error:", error)
  }
}

/**
 * Refresh current session expiry (extend session)
 * Returns true if refreshed, false otherwise
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) return false

    const [session] = await sql`
      SELECT * FROM admin_sessions WHERE session_token = ${sessionToken} AND expires_at > NOW()
    `

    if (!session) return false

    const expiresAt = new Date(Date.now() + SESSION_DURATION)
    await sql`UPDATE admin_sessions SET expires_at = ${expiresAt} WHERE id = ${session.id}`

    const isProd = process.env.NODE_ENV === "production"
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: expiresAt,
      path: "/",
    })

    return true
  } catch (error) {
    console.error("[v0] refreshSession error:", error)
    return false
  }
}

/**
 * Clean up expired sessions (call this periodically)
 */
export async function cleanupExpiredSessions(): Promise<void> {
  await sql`DELETE FROM admin_sessions WHERE expires_at < NOW()`
}

/**
 * Require admin authentication - use in Server Components
 */
export async function requireAuth(): Promise<AdminUser> {
  const admin = await validateSession()
  if (!admin) {
    throw new Error("Unauthorized")
  }

  return admin
}

/**
 * Check if user has required role
 */
export function hasRole(admin: AdminUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(admin.role)
}
