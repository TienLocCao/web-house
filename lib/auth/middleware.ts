import type { AdminUser } from "./types"
import { validateSession } from "./validation"

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<AdminUser> {
  const admin = await validateSession()
  if (!admin) throw new Error("Unauthorized")
  return admin
}

/**
 * Check if admin has required role - throws error if not
 */
export function requireRole(admin: AdminUser, roles: string[]) {
  if (!roles.includes(admin.role)) {
    throw new Error("Forbidden")
  }
}

/**
 * Check if admin has required role - returns boolean
 */
export function hasRole(admin: AdminUser, roles: string[]): boolean {
  return roles.includes(admin.role)
}