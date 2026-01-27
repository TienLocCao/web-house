import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit, getClientIP } from "@/lib/middleware"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/search?q=query&limit=10
export async function GET(request: NextRequest) {
  try {
    /* ================= Rate limit ================= */
    const ip = getClientIP(request)
    const rate = rateLimit(`search_${ip}`, {
      interval: 60_000,
      maxRequests: 60,
    })

    if (!rate.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    /* ================= Query params ================= */
    const sp = request.nextUrl.searchParams
    const query = sp.get("q")?.trim()
    const limit = Math.min(Number(sp.get("limit")) || 10, 20)

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        products: []
      })
    }

    /* ================= Search suggestions ================= */
    // Get product names that match the query
    const suggestions = await sql`
      SELECT DISTINCT name
      FROM products
      WHERE name ILIKE ${"%" + query + "%"}
      AND is_available = true
      ORDER BY name
      LIMIT ${limit}
    `

    /* ================= Search products ================= */
    const products = await sql`
      SELECT
        id,
        name,
        slug,
        image_url,
        price,
        category_id
      FROM products
      WHERE (name ILIKE ${"%" + query + "%"}
             OR description ILIKE ${"%" + query + "%"})
      AND is_available = true
      ORDER BY
        CASE
          WHEN name ILIKE ${query + "%"} THEN 1
          WHEN name ILIKE ${"%" + query + "%"} THEN 2
          ELSE 3
        END,
        rating DESC,
        review_count DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      suggestions: suggestions.map((s: any) => s.name),
      products: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image_url: p.image_url,
        price: p.price,
      }))
    })

  } catch (err) {
    console.error("[search.GET]", err)
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    )
  }
}