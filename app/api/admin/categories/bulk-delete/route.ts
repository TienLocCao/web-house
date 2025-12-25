import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"
import { deleteImageByUrl } from "@/lib/fs"

export const runtime = "nodejs"

const Schema = z.object({ mode: z.enum(["page", "all"]), ids: z.array(z.number()).optional() })

export async function POST(req: NextRequest) {
  await requireAuth()
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: "Invalid payload" }, { status: 400 })

  const { mode, ids } = parsed.data

  if (mode === "page") {
    if (!ids || ids.length === 0) return NextResponse.json({ message: "No ids provided" }, { status: 400 })

    const images = await sql`SELECT image_url FROM categories WHERE id = ANY(${ids})` as { image_url: string | null }[]

    await sql`DELETE FROM categories WHERE id = ANY(${ids})`

    await Promise.all(images.map((p) => deleteImageByUrl(p.image_url)))

    return NextResponse.json({ message: `Deleted ${ids.length} categories` })
  }

  if (mode === "all") {
    const images = await sql`SELECT image_url FROM categories` as { image_url: string | null }[]

    await sql`DELETE FROM categories`

    await Promise.all(images.map((p) => deleteImageByUrl(p.image_url)))

    return NextResponse.json({ message: "Deleted all categories", deleted: images.length })
  }

  return NextResponse.json({ message: "Unsupported mode" }, { status: 400 })
}