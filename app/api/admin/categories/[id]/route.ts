import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { CategoryUpdateSchema } from "@/lib/schemas/category.schema"
import { z } from "zod"
import { deleteImageByUrl } from "@/lib/fs"

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const { id } = params
    const categoryId = Number(id)
    const body = await request.json()
    const validated = CategoryUpdateSchema.parse(body)

    if (validated.slug) {
      const [conflict] = await sql`SELECT id FROM categories WHERE slug = ${validated.slug} AND id != ${categoryId}`
      if (conflict) {
        return NextResponse.json({ message: "Validation failed", errors: [{ path: "slug", message: "Category with this slug already exists" }] }, { status: 400 })
      }
    }

    const [updated] = await sql`
      UPDATE categories SET
        name = COALESCE(${validated.name ?? null}, name),
        slug = COALESCE(${validated.slug ?? null}, slug),
        description = COALESCE(${validated.description ?? null}, description),
        image_url = COALESCE(${validated.image_url ?? null}, image_url)
      WHERE id = ${categoryId}
      RETURNING *
    `

    return NextResponse.json({ message: "Category updated", category: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      return NextResponse.json({ message: "Validation failed", errors: issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ message: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth()
  const { id } = params
  const categoryId = Number(id)

  const [category] = await sql`SELECT image_url FROM categories WHERE id = ${categoryId}`
  if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 })

  if (category.image_url) {
    try {
      await deleteImageByUrl(category.image_url)
    } catch (err) {
      console.warn("Cannot delete image file:", err)
    }
  }

  await sql`DELETE FROM categories WHERE id = ${categoryId}`

  return NextResponse.json({ message: "Category deleted" })
}