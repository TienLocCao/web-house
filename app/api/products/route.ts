import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ProductQuerySchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/request"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/products - Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`products_${ip}`, {
      interval: 60000, // 1 minute
      maxRequests: 30,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        },
      )
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      category: searchParams.get("category") || undefined,
      room_type: searchParams.get("room_type") || undefined,
      min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
      max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
      is_featured: searchParams.get("is_featured") === "true" ? true : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
      sort: (searchParams.get("sort") as any) || "newest",
    }

    const validatedParams = ProductQuerySchema.parse(queryParams)

    // Build SQL query with parameterized inputs to prevent SQL injection
    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = true
    `
    const params: any[] = []
    let paramIndex = 1

    if (validatedParams.room_type) {
      query += ` AND p.room_type = $${paramIndex}`
      params.push(validatedParams.room_type)
      paramIndex++
    }

    if (validatedParams.category) {
      query += ` AND c.slug = $${paramIndex}`
      params.push(validatedParams.category)
      paramIndex++
    }

    if (validatedParams.min_price !== undefined) {
      query += ` AND p.price >= $${paramIndex}`
      params.push(validatedParams.min_price)
      paramIndex++
    }

    if (validatedParams.max_price !== undefined) {
      query += ` AND p.price <= $${paramIndex}`
      params.push(validatedParams.max_price)
      paramIndex++
    }

    if (validatedParams.is_featured) {
      query += ` AND p.is_featured = true`
    }

    // Add sorting
    switch (validatedParams.sort) {
      case "price_asc":
        query += " ORDER BY p.price ASC"
        break
      case "price_desc":
        query += " ORDER BY p.price DESC"
        break
      case "rating":
        query += " ORDER BY p.rating DESC, p.review_count DESC"
        break
      case "newest":
      default:
        query += " ORDER BY p.created_at DESC"
    }

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(validatedParams.limit, validatedParams.offset)

    // Execute query
    const products = await sql`${query}, ${params}`

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM products WHERE is_available = true"
    const countParams: any[] = []
    let countParamIndex = 1

    if (validatedParams.room_type) {
      countQuery += ` AND room_type = $${countParamIndex}`
      countParams.push(validatedParams.room_type)
      countParamIndex++
    }

    if (validatedParams.is_featured) {
      countQuery += ` AND is_featured = true`
    }

    const [{ total }] = await sql`${countQuery}, ${countParams}`

    return NextResponse.json(
      {
        data: products,
        pagination: {
          total: Number(total),
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          hasMore: validatedParams.offset + validatedParams.limit < Number(total),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
