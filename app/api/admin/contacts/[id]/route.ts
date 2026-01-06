import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/admin-api"

export const runtime = "edge"

// DELETE /api/admin/contacts/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(request, async (admin) => {
    if (!["super_admin", "admin"].includes(admin.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }
    try {
      const contactId = Number.parseInt(params.id)

      await sql`DELETE FROM contact_inquiries WHERE id = ${contactId}`

      return NextResponse.json({ message: "Contact inquiry deleted successfully" })
    } catch (error) {
      console.error("[v0] Delete contact error:", error)
      return NextResponse.json({ error: "Failed to delete contact inquiry" }, { status: 500 })
    }
  })
}
