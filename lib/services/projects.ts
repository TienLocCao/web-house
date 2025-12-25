import { sql } from "@/lib/db"
import query from "@/lib/db/query"
import type { Project } from "@/lib/types/project"
import type { PaginatedResult } from "@/lib/types/pagination"

export async function getProjects({ page = 1, limit = 5, sort = [], filter = {} }: { page?: number; limit?: number; sort?: any[]; filter?: any }): Promise<PaginatedResult<Project>> {
  const { where } = query.buildWhere(filter)
  const orderBy = query.buildOrderBy(sort)
  const { offset } = query.buildPagination(page, limit)

  const items = (await sql`
    SELECT id, title, slug, client_name, location, image_url, gallery, room_type, status, completion_date, budget, featured, created_at, updated_at
    FROM projects
    ${sql.unsafe(where)}
    ${sql.unsafe(orderBy)}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as Project[]

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM projects ${sql.unsafe(where)}
  `) as { count: number }[]

  return { items, total: count, page, limit }
}