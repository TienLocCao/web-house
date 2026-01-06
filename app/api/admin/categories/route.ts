import { NextRequest, NextResponse } from "next/server"
import { getCategories } from "@/lib/services/categories"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/admin-api"
import { CategoryCreateSchema } from "@/lib/schemas/category.schema"
import { z } from "zod"

export const runtime = "edge"

export const GET = (request: NextRequest) =>
  withAdminAuth(request, async (admin) => {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") ?? 1)
    const limit = Number(searchParams.get("limit") ?? 5)
    let sort: any[] = []
    try {
      sort = JSON.parse(searchParams.get("sort") ?? "[]")
    } catch {}

    // support filtering
    const search = searchParams.get("search") ?? undefined
    const filter: any = {}
    if (search) filter.name = search

    const result = await getCategories({ page, limit, sort, filter })
    return NextResponse.json(result)
  })

export const POST = (request: NextRequest) =>
  withAdminAuth(request, async (admin) => {
    if (!["super_admin", "admin"].includes(admin.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }
    try {
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
  })