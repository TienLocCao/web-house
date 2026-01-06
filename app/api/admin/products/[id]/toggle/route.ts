import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/middleware"

export const runtime = "edge"

// PATCH /api/admin/products/[id]/toggle - Toggle product availability
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(request, async (admin) => {
    try {
      if (!["super_admin", "admin"].includes(admin.role)) {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 }
        )
      }
      const productId = Number.parseInt(params.id)
    const { is_available } = await request.json()

    await sql`UPDATE products SET is_available = ${is_available} WHERE id = ${productId}`

      return NextResponse.json({ message: "Product status updated" })
    } catch (error) {
      console.error("[v0] Toggle product error:", error)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }
  })
}
