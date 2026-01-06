import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAdminAuth } from "@/lib/admin-api"
import { ProjectUpdateSchema } from "@/lib/schemas/project.schema"
import { z } from "zod"
import { deleteImageByUrl } from "@/lib/fs"

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(request, async (admin) => {
    try {
      const { id } = await params
    const projectId = Number(id)
    const body = await request.json()
    const validated = ProjectUpdateSchema.parse(body)

    if (validated.slug) {
      const [conflict] = await sql`SELECT id FROM projects WHERE slug = ${validated.slug} AND id != ${projectId}`
      if (conflict) return NextResponse.json({ message: "Validation failed", errors: [{ path: "slug", message: "Project with this slug already exists" }] }, { status: 400 })
    }

    const [updated] = await sql`
      UPDATE projects SET
        title = COALESCE(${validated.title ?? null}, title),
        slug = COALESCE(${validated.slug ?? null}, slug),
        description = COALESCE(${validated.description ?? null}, description),
        client_name = COALESCE(${validated.client_name ?? null}, client_name),
        location = COALESCE(${validated.location ?? null}, location),
        image_url = COALESCE(${validated.image_url ?? null}, image_url),
        gallery = COALESCE(${validated.gallery ? JSON.stringify(validated.gallery) : null}, gallery),
        room_type = COALESCE(${validated.room_type ?? null}, room_type),
        status = COALESCE(${validated.status ?? null}, status),
        completion_date = COALESCE(${validated.completion_date ?? null}, completion_date),
        budget = COALESCE(${validated.budget ?? null}, budget),
        featured = COALESCE(${validated.featured ?? null}, featured)
      WHERE id = ${projectId}
      RETURNING *
    `

      return NextResponse.json({ message: "Project updated", project: updated })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
        return NextResponse.json({ message: "Validation failed", errors: issues }, { status: 400 })
      }
      console.error(error)
      return NextResponse.json({ message: "Update failed" }, { status: 500 })
    }
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(req, async (admin) => {
    const { id } = await params
    const projectId = Number(id)

    const [project] = await sql`SELECT image_url, gallery FROM projects WHERE id = ${projectId}`
    if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 })

    if (project.image_url) await deleteImageByUrl(project.image_url)
    if (project.gallery && Array.isArray(project.gallery)) await Promise.all(project.gallery.map((u: string) => deleteImageByUrl(u)))

    await sql`DELETE FROM projects WHERE id = ${projectId}`

    return NextResponse.json({ message: "Project deleted" })
  })
}