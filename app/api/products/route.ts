import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ProductQuerySchema, getClientIP } from "@/lib/utils"
import {  rateLimit } from "@/lib/middleware/rate-limit"

/**
 * ⚠️ CHỈ để edge nếu DB dùng HTTP driver (Neon / Turso / PlanetScale)
 * Nếu không → đổi thành "nodejs"
 */
export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    /* ================= Rate limit ================= */
    const ip = getClientIP(request)
    const rate = rateLimit(`products_${ip}`, {
      interval: 60_000,
      maxRequests: 30,
    })

    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      )
    }

    /* ================= Parse query ================= */
    const sp = request.nextUrl.searchParams
    const q = ProductQuerySchema.parse({
      query: sp.get("query") || undefined,
      category: sp.get("category") || undefined,
      room_type: sp.getAll("room_type").length > 0 ? sp.getAll("room_type") : undefined,
      min_price: sp.get("min_price")
        ? Number(sp.get("min_price"))
        : undefined,
      max_price: sp.get("max_price")
        ? Number(sp.get("max_price"))
        : undefined,
      is_featured:
        sp.get("is_featured") !== null
          ? sp.get("is_featured") === "true"
          : undefined,
      limit: sp.get("limit") ? Number(sp.get("limit")) : 12,
      offset: sp.get("offset") ? Number(sp.get("offset")) : 0,
      sort: sp.get("sort") || "newest",
    })

    /* ================= WHERE conditions ================= */
    const where: any[] = [sql`p.is_available = true`]

    if (q.query)
      where.push(sql`p.name ILIKE ${"%" + q.query + "%"}`)

    if (q.room_type && q.room_type.length > 0)
      where.push(sql`p.room_type = ANY(${q.room_type})`)

    if (q.category)
      where.push(sql`c.slug = ${q.category}`)

    if (q.min_price !== undefined)
      where.push(sql`p.price >= ${q.min_price}`)

    if (q.max_price !== undefined)
      where.push(sql`p.price <= ${q.max_price}`)

    if (q.is_featured !== undefined)
      where.push(sql`p.is_featured = ${q.is_featured}`)

    const whereSql =
      where.length > 0
        ? where.reduce((acc, cur, i) =>
            i === 0 ? cur : sql`${acc} AND ${cur}`,
          )
        : sql`TRUE`

    /* ================= ORDER BY ================= */
    let orderBy = sql`p.created_at DESC`

    if (q.sort === "price_asc") orderBy = sql`p.price ASC`
    if (q.sort === "price_desc") orderBy = sql`p.price DESC`
    if (q.sort === "rating")
      orderBy = sql`p.rating DESC, p.review_count DESC`

    /* ================= PRODUCTS QUERY ================= */
    const products = await sql`
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ${q.limit}
      OFFSET ${q.offset}
    `

    /* ================= COUNT QUERY ================= */
    const [{ total }] = await sql`
      SELECT COUNT(*)::int AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereSql}
    `

    return NextResponse.json(
      {
        data: products,
        pagination: {
          total,
          limit: q.limit,
          offset: q.offset,
          hasMore: q.offset + q.limit < total,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=86400",
        },
      },
    )
  } catch (err) {
    console.error("[products.GET]", err)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    )
  }
}
