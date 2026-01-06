import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"
import { AUTH_CONFIG } from "./config"

const { SESSION_DURATION } = AUTH_CONFIG

/**
 * Create a new admin session
 */
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
 * Destroy admin session
 */
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
