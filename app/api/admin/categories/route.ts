import { NextRequest, NextResponse } from "next/server"
import { getCategories } from "@/lib/services/categories"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { CategoryCreateSchema } from "@/lib/schemas/category.schema"
import { z } from "zod"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 5)
  const sort = JSON.parse(searchParams.get("sort") ?? "[]")
  const result = await getCategories({ page, limit, sort })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const validated = CategoryCreateSchema.parse(body)

    const [existing] = await sql`SELECT id FROM categories WHERE slug = ${validated.slug}`
    if (existing) {
      return NextResponse.json({ message: "Validation failed", errors: [{ path: "slug", message: "Category with this slug already exists" }] }, { status: 400 })
    }

    const [category] = await sql`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (${validated.name}, ${validated.slug}, ${validated.description}, ${validated.image_url})
      RETURNING *
    `

    return NextResponse.json({ message: "Category created", category }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      return NextResponse.json({ message: "Validation failed", errors: issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ message: "Create category failed" }, { status: 500 })
  }
}