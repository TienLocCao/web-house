import { NextRequest, NextResponse } from "next/server"
import { validateSessionFromRequest } from "@/lib/auth"
import type { AdminUser } from "@/lib/auth"

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
