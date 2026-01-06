import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit, getClientIP } from "@/lib/middleware"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/projects
export async function GET(request: NextRequest) {
  try {
    /* ================= Rate limit ================= */
    const ip = getClientIP(request)
    const rate = rateLimit(`projects_${ip}`, {
      interval: 60_000,
      maxRequests: 30,
    })

    if (!rate.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    /* ================= Query params ================= */
    const sp = request.nextUrl.searchParams
    const featured = sp.get("featured") === "true"
    const limit = Number(sp.get("limit")) || 12
    const offset = Number(sp.get("offset")) || 0

    /* ================= WHERE ================= */
    const where: any[] = []

    if (featured) {
      where.push(sql`featured = true`)
    }

    const whereClause =
      where.length > 0
        ? sql`WHERE ${where.reduce((acc, cur, i) =>
            i === 0 ? cur : sql`${acc} AND ${cur}`
          )}`
        : sql``

    /* ================= DATA QUERY ================= */
    const projects = await sql`
      SELECT *
      FROM projects
      ${whereClause}
      ORDER BY completion_date DESC NULLS LAST, created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    /* ================= COUNT QUERY ================= */
    const [{ total }] = await sql`
      SELECT COUNT(*)::int AS total
      FROM projects
      ${whereClause}
    `

    return NextResponse.json(
      {
        data: projects,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
        },
      },
    )
  } catch (err) {
    console.error("[projects.GET]", err)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    )
  }
}
