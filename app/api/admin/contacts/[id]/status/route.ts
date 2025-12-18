import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const runtime = "edge"

// PATCH /api/admin/contacts/[id]/status - Update contact status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const contactId = Number.parseInt(params.id)
    const { status } = await request.json()

    await sql`UPDATE contact_inquiries SET status = ${status} WHERE id = ${contactId}`

    return NextResponse.json({ message: "Contact status updated successfully" })
  } catch (error) {
    console.error("[v0] Update contact status error:", error)
    return NextResponse.json({ error: "Failed to update contact status" }, { status: 500 })
  }
}
