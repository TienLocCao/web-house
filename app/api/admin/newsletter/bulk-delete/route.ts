import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"
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
    await sql`DELETE FROM newsletter_subscribers WHERE id = ANY(${ids})`
    return NextResponse.json({ message: `Deleted ${ids.length} subscribers` })
  }
  if (mode === "all") {
    const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM newsletter_subscribers`) as { count: number }[]
    await sql`DELETE FROM newsletter_subscribers`
    return NextResponse.json({ message: "Deleted all subscribers", deleted: count })
  }
  return NextResponse.json({ message: "Unsupported mode" }, { status: 400 })
}