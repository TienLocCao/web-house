import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/middleware"
import { z } from "zod"
import { deleteImageByUrl } from "@/lib/server/file-system"

export const runtime = "nodejs"

const Schema = z.object({ mode: z.enum(["page", "all"]), ids: z.array(z.number()).optional() })

export const POST = (req: NextRequest) =>
  withAdminAuth(req, async (admin) => {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ message: "Invalid payload" }, { status: 400 })

    const { mode, ids } = parsed.data

    if (mode === "page") {
      if (!ids || ids.length === 0) return NextResponse.json({ message: "No ids provided" }, { status: 400 })

      const rows = await sql`SELECT image_url, gallery FROM projects WHERE id = ANY(${ids})` as { image_url: string | null, gallery: string[] | null }[]

      await sql`DELETE FROM projects WHERE id = ANY(${ids})`

      await Promise.all(rows.flatMap((r) => [r.image_url, ...(r.gallery || [])].map((u) => deleteImageByUrl(u))))

      return NextResponse.json({ message: `Deleted ${ids.length} projects` })
    }

    if (mode === "all") {
      const rows = await sql`SELECT image_url, gallery FROM projects` as { image_url: string | null, gallery: string[] | null }[]

      await sql`DELETE FROM projects`

      await Promise.all(rows.flatMap((r) => [r.image_url, ...(r.gallery || [])].map((u) => deleteImageByUrl(u))))

      return NextResponse.json({ message: "Deleted all projects", deleted: rows.length })
    }

    return NextResponse.json({ message: "Unsupported mode" }, { status: 400 })
  })