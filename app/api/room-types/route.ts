import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "edge"

// GET /api/room-types - returns Postgres enum values for `room_type`
export async function GET() {
  try {
    const rows = await sql`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'room_type'
      ORDER BY enumsortorder
    `

    const values = rows.map((r: any) => r.enumlabel)

    return NextResponse.json({ values })
  } catch (error) {
    console.error("Error fetching room types:", error)
    return NextResponse.json({ error: "Failed to fetch room types" }, { status: 500 })
  }
}
