import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
export const runtime = "nodejs"
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth()
  const id = Number(params.id)
  const body = await _req.json()
  const is_active = typeof body.is_active === "boolean" ? body.is_active : null
  if (is_active === null) return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
  await sql`UPDATE newsletter_subscribers SET is_active = ${is_active} WHERE id = ${id}`
  return NextResponse.json({ message: "Subscriber updated" })
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth()
  const id = Number(params.id)
  await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`
  return NextResponse.json({ message: "Subscriber deleted" })
}