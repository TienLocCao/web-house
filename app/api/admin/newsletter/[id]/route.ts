import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/middleware"

export const runtime = "nodejs"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdminAuth(req, async (admin) => {
    if (!["super_admin", "admin"].includes(admin.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }
    const { id } = await params
    const subscriberId = Number(id)
    const body = await req.json()
    const is_active = typeof body.is_active === "boolean" ? body.is_active : null
    if (is_active === null) return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
    await sql`UPDATE newsletter_subscribers SET is_active = ${is_active} WHERE id = ${subscriberId}`
    return NextResponse.json({ message: "Subscriber updated" })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdminAuth(req, async (admin) => {
    const { id } = await params
    const subscriberId = Number(id)
    await sql`DELETE FROM newsletter_subscribers WHERE id = ${subscriberId}`
    return NextResponse.json({ message: "Subscriber deleted" })
  })
}