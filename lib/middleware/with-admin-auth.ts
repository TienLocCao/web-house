import { NextRequest, NextResponse } from "next/server"
import { validateSessionFromRequest } from "@/lib/auth"
import type { AdminUser } from "@/lib/auth"

/**
 * Middleware wrapper for admin authentication
 * Validates admin session and passes admin user to handler
 */
export async function withAdminAuth<T>(
  req: NextRequest,
  handler: (admin: AdminUser) => Promise<T>
): Promise<T | NextResponse> {
  const admin = await validateSessionFromRequest(req)

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return handler(admin)
}