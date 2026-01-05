import { sql } from "@/lib/db"
import query from "@/lib/db/query"
import type { Project } from "@/lib/types/project"
import type { PaginatedResult } from "@/lib/types/pagination"

export async function getProjects({ page = 1, limit = 5, sort = [], filter = {} }: { page?: number; limit?: number; sort?: any[]; filter?: any }): Promise<PaginatedResult<Project>> {
  const where = query.buildWhere(filter)
  const orderBy = query.buildOrderBy(sort)
  const { offset } = query.buildPagination(page, limit)

  const items = (await sql`
    SELECT id, title, slug, client_name, location, image_url, gallery, room_type, status, completion_date, budget, featured, created_at, updated_at
    FROM projects
    ${where}
    ${sql.unsafe(orderBy)}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as Project[]

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM projects ${where}
  `) as { count: number }[]

  return { items, total: count, page, limit }
}


/**
 * Chuẩn hóa payload trước khi gửi API
 */
function normalizeProjectPayload(project: Project) {
  return {
    ...project,
    budget:
      project.budget === "" || project.budget == null
        ? null
        : Number(project.budget),

    gallery: Array.isArray(project.gallery)
      ? project.gallery.map((g: any) =>
          typeof g === "string" ? g : g.url
        )
      : [],
  }
}

/**
 * Create project
 */
export async function createProject(project: Project) {
  const payload = normalizeProjectPayload(project)

  const res = await fetch("/api/admin/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error("Create project failed")
  }

  return res.json()
}

/**
 * Update project
 */
export async function updateProject(id: string, project: Project) {
  const payload = normalizeProjectPayload(project)

  const res = await fetch(`/api/admin/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error("Update project failed")
  }

  return res.json()
}