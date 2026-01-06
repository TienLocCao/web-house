import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/middleware"
import { getProducts } from "@/lib/services/products"
import { ProductCreateSchema } from "@/lib/schemas/product.schema"
import { z } from "zod"

export const runtime = "edge"

/* =========================
   GET /api/admin/products
========================= */
export const GET = (req: NextRequest) =>
  withAdminAuth(req, async (admin) => {
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page") ?? 1)
    const limit = Number(searchParams.get("limit") ?? 5)

    let sort: any[] = []
    try {
      sort = JSON.parse(searchParams.get("sort") || "[]")
    } catch {}

    const filter: any = {}
    const search = searchParams.get("search")
    const roomType = searchParams.get("room_type")

    if (search) filter.name = search
    if (roomType) filter.room_type = roomType

    const result = await getProducts({ page, limit, sort, filter })
    return NextResponse.json(result)
  })

/* =========================
   POST /api/admin/products
========================= */
export const POST = (req: NextRequest) =>
  withAdminAuth(req, async (admin) => {
    // 🔐 role check
    if (!["super_admin", "admin"].includes(admin.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }

    try {
      const body = await req.json()
      const validated = ProductCreateSchema.parse(body)

      const [existing] =
        await sql`SELECT id FROM products WHERE slug = ${validated.slug}`

      if (existing) {
        return NextResponse.json(
          {
            message: "Validation failed",
            errors: [
              { path: "slug", message: "Product with this slug already exists" },
            ],
          },
          { status: 400 }
        )
      }

      const [product] = await sql`
        INSERT INTO products (
          name, slug, description, price, original_price,
          category_id, room_type, image_url,
          gallery, stock, is_featured, is_available,
          dimensions, material, color
        ) VALUES (
          ${validated.name},
          ${validated.slug},
          ${validated.description},
          ${validated.price},
          ${validated.original_price},
          ${validated.category_id},
          ${validated.room_type},
          ${validated.image_url},
          ${JSON.stringify(validated.gallery)},
          ${validated.stock},
          ${validated.is_featured},
          ${validated.is_available},
          ${JSON.stringify(validated.dimensions)},
          ${validated.material},
          ${validated.color}
        )
        RETURNING *
      `

      return NextResponse.json(
        { message: "Product created successfully", product },
        { status: 201 }
      )
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            message: "Validation failed",
            errors: error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          },
          { status: 400 }
        )
      }

      console.error(error)
      return NextResponse.json(
        { message: "Create product failed" },
        { status: 500 }
      )
    }
  })
