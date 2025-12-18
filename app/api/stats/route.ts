import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/request"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/stats - Get website statistics
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`stats_${ip}`, {
      interval: 60000,
      maxRequests: 60,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // Get all stats in parallel
    const [productsCount, projectsCount, reviewsCount, ordersCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM products WHERE is_available = true`,
      sql`SELECT COUNT(*) as count FROM projects WHERE status = 'completed'`,
      sql`SELECT COUNT(*) as count FROM reviews WHERE is_approved = true`,
      sql`SELECT COUNT(*) as count FROM orders`,
    ])

    const stats = {
      total_products: Number(productsCount[0].count),
      completed_projects: Number(projectsCount[0].count),
      customer_reviews: Number(reviewsCount[0].count),
      total_orders: Number(ordersCount[0].count),
      years_experience: 7, // From the design
      countries_shipped: 2, // From the design
    }

    return NextResponse.json(
      { data: stats },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
