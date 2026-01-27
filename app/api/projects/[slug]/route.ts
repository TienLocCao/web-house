import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit, getClientIP } from "@/lib/middleware"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/projects/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    params = await params
    /* ================= Rate limit ================= */
    const ip = getClientIP(request)
    const rate = rateLimit(`project_${ip}`, {
      interval: 60_000,
      maxRequests: 30,
    })

    if (!rate.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const slug = params.slug

    /* ================= PROJECT QUERY ================= */
    const [project] = await sql`
      SELECT *
      FROM projects
      WHERE slug = ${slug}
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        project,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=86400",
        },
      }
    )
  } catch (err) {
    console.error("[project.GET]", err)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}