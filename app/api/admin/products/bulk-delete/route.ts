import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/admin-api"
import { z } from "zod"
import { deleteImageByUrl } from "@/lib/fs"

export const runtime = "nodejs"

const Schema = z.object({
  mode: z.enum(["page", "all"]),
  ids: z.array(z.number()).optional(),
})

export const POST = (req: NextRequest) =>
  withAdminAuth(req, async (admin) => {
    if (!["super_admin", "admin"].includes(admin.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }
    const body = await req.json()
    const parsed = Schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      )
    }

    const { mode, ids } = parsed.data

    /* ============================
       MODE: PAGE
    ============================ */
    if (mode === "page") {
      if (!ids || ids.length === 0) {
        return NextResponse.json(
          { message: "No ids provided" },
          { status: 400 }
        )
      }

      // 1️⃣ lấy danh sách ảnh
      const images = await sql
      `
        SELECT image_url
        FROM products
        WHERE id = ANY(${ids})
      ` as { image_url: string | null }[]

      // 2️⃣ xoá DB
      await sql`
        DELETE FROM products
        WHERE id = ANY(${ids})
      `

      // 3️⃣ xoá ảnh
      await Promise.all(
        images.map((p) => deleteImageByUrl(p.image_url))
      )

      return NextResponse.json({
        message: `Deleted ${ids.length} products`,
      })
    }

    /* ============================
       MODE: ALL
    ============================ */
    if (mode === "all") {
      // 1️⃣ lấy toàn bộ ảnh
      const images = await sql
      `
        SELECT image_url FROM products
      ` as { image_url: string | null }[]

      // 2️⃣ xoá DB
      await sql`DELETE FROM products`

      // 3️⃣ xoá ảnh
      await Promise.all(
        images.map((p) => deleteImageByUrl(p.image_url))
      )

      return NextResponse.json({
        message: "Deleted all products",
        deleted: images.length,
      })
    }

    return NextResponse.json(
      { message: "Unsupported mode" },
      { status: 400 }
    )
  })
