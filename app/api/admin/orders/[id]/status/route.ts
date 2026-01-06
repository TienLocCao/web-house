import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/middleware"
import { z } from "zod"

export const runtime = "edge"

const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
})

// PATCH /api/admin/orders/[id]/status - Update order status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(request, async (admin) => {
    if (!["super_admin", "admin"].includes(admin.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }
    try {
      const orderId = Number.parseInt(params.id)
    const body = await request.json()
    const { status } = StatusUpdateSchema.parse(body)

    // Check if order exists
    const [order] = await sql`SELECT id FROM orders WHERE id = ${orderId}`

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update order status
    await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId}`

      return NextResponse.json({ message: "Order status updated successfully" })
    } catch (error) {
      console.error("[v0] Update order status error:", error)

      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
      }

      if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }
  })
}
