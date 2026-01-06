import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit, getClientIP } from "@/lib/middleware"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/products/:slug - Get single product by slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`product_${ip}`, {
      interval: 60000,
      maxRequests: 60,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // Parameterized query to prevent SQL injection
    const products = await sql
      `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ${params.slug} AND p.is_available = true
      LIMIT 1
      `
    

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get related products
    const relatedProducts = await sql
      `
      SELECT * FROM products
      WHERE room_type = ${products[0].room_type} 
        AND slug != $2 
        AND is_available = true
      ORDER BY rating DESC
      LIMIT 4
      `

    // Get reviews for the product
    const reviews = await sql
      `
      SELECT * FROM reviews
      WHERE product_id = ${products[0].id} AND is_approved = true
      ORDER BY created_at DESC
      LIMIT 10
      `

    return NextResponse.json(
      {
        product: products[0],
        relatedProducts,
        reviews,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
