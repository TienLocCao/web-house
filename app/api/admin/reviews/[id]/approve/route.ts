import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/middleware"

export const runtime = "edge"

// PATCH /api/admin/reviews/[id]/approve - Approve review
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(request, async (admin) => {
    try {
      const reviewId = Number.parseInt(params.id)

    await sql`UPDATE reviews SET is_approved = true WHERE id = ${reviewId}`

    // Update product rating
    const [review] = await sql`SELECT product_id FROM reviews WHERE id = ${reviewId}`

    if (review) {
      const [stats] = await sql`
        SELECT AVG(rating)::decimal(3,2) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ${review.product_id} AND is_approved = true
      `

      await sql`UPDATE products SET rating = ${stats.avg_rating || 0}, review_count = ${stats.count || 0} WHERE id = ${review.product_id}`
    }

      return NextResponse.json({ message: "Review approved successfully" })
    } catch (error) {
      console.error("[v0] Approve review error:", error)
      return NextResponse.json({ error: "Failed to approve review" }, { status: 500 })
    }
  })
}
