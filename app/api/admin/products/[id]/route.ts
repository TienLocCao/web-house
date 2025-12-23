import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ProductUpdateSchema } from "@/lib/schemas/product.schema"
import { z } from "zod"

export const runtime = "nodejs"

// PATCH /api/admin/products/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    await requireAuth()
    const productId = Number(id)

    const body = await request.json()
    const validated = ProductUpdateSchema.parse(body)
    validated.room_type = 'living_room' 

    // If slug is being changed, make sure it's unique (not belonging to another product)
    if (validated.slug) {
      const [conflict] = await sql`SELECT id FROM products WHERE slug = ${validated.slug} AND id != ${productId}`
      if (conflict) {
        return NextResponse.json(
          {
            message: "Validation failed",
            errors: [{ path: "slug", message: "Product with this slug already exists" }],
          },
          { status: 400 }
        )
      }
    }

    const [updated] = await sql`
      UPDATE products SET
        name = COALESCE(${validated.name ?? null}, name),
        slug = COALESCE(${validated.slug ?? null}, slug),
        description = COALESCE(${validated.description ?? null}, description),
        price = COALESCE(${validated.price ?? null}, price),
        original_price = COALESCE(${validated.original_price ?? null}, original_price),
        category_id = COALESCE(${validated.category_id ?? null}, category_id),
        room_type = COALESCE(${validated.room_type ?? null}, room_type),
        image_url = COALESCE(${validated.image_url ?? null}, image_url),
        gallery = COALESCE(${validated.gallery ? JSON.stringify(validated.gallery) : null}, gallery),
        stock = COALESCE(${validated.stock ?? null}, stock),
        is_featured = COALESCE(${validated.is_featured ?? null}, is_featured),
        is_available = COALESCE(${validated.is_available ?? null}, is_available),
        dimensions = COALESCE(${validated.dimensions ? JSON.stringify(validated.dimensions) : null}, dimensions),
        material = COALESCE(${validated.material ?? null}, material),
        color = COALESCE(${validated.color ?? null}, color)
      WHERE id = ${productId}
      RETURNING *
    `

    return NextResponse.json({ message: "Product updated", product: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      return NextResponse.json({ message: "Validation failed", errors: issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ message: "Update failed" }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  await requireAuth()
  await sql`DELETE FROM products WHERE id = ${Number(id)}`
  return NextResponse.json({ message: "Product deleted" })
}
