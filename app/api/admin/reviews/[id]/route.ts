import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/admin-api"

export const runtime = "edge"

// DELETE /api/admin/reviews/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(request, async (admin) => {
    try {
      const reviewId = Number.parseInt(params.id)

    // Get product_id before deleting
    const [review] = await sql`SELECT product_id FROM reviews WHERE id = ${reviewId}`

    await sql`DELETE FROM reviews WHERE id = ${reviewId}`

    // Update product rating
    if (review) {
      const [stats] = await sql`
        SELECT AVG(rating)::decimal(3,2) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ${review.product_id} AND is_approved = true
      `

      await sql`UPDATE products SET rating = ${stats.avg_rating || 0}, review_count = ${stats.count || 0} WHERE id = ${review.product_id}`
    }

      return NextResponse.json({ message: "Review deleted successfully" })
    } catch (error) {
      console.error("[v0] Delete review error:", error)
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
    }
  })
}
