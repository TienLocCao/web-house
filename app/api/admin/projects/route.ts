import { NextRequest, NextResponse } from "next/server"
import { getProjects } from "@/lib/services/projects"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ProjectCreateSchema } from "@/lib/schemas/project.schema"
import { z } from "zod"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 5)
  let sort: any[] = []
  try {
    sort = JSON.parse(searchParams.get("sort") ?? "[]")
  } catch {}

  // support filtering
  const search = searchParams.get("search") ?? undefined
  const status = searchParams.get("status") ?? undefined
  const filter: any = {}
  if (search) filter.title = search
  if (status) filter.status = status

  const result = await getProjects({ page, limit, sort, filter })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const validated = ProjectCreateSchema.parse(body)

    const [existing] = await sql`SELECT id FROM projects WHERE slug = ${validated.slug}`
    if (existing) return NextResponse.json({ message: "Validation failed", errors: [{ path: "slug", message: "Project with this slug already exists" }] }, { status: 400 })

    const [project] = await sql`
      INSERT INTO projects (title, slug, description, client_name, location, image_url, gallery, room_type, status, completion_date, budget, featured)
      VALUES (${validated.title}, ${validated.slug}, ${validated.description}, ${validated.client_name}, ${validated.location}, ${validated.image_url}, ${JSON.stringify(validated.gallery)}, ${validated.room_type}, ${validated.status}, ${validated.completion_date}, ${validated.budget}, ${validated.featured})
      RETURNING *
    `

    return NextResponse.json({ message: "Project created", project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      return NextResponse.json({ message: "Validation failed", errors: issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ message: "Create project failed" }, { status: 500 })
  }
}