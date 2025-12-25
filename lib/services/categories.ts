import { sql } from "@/lib/db"
import query from "@/lib/db/query"
import type { Category } from "@/lib/types/category"
import type { PaginatedResult } from "@/lib/types/pagination"

export async function getCategories({
  page = 1,
  limit = 5,
  sort = [],
  filter = {},
}: {
  page?: number
  limit?: number
  sort?: any[]
  filter?: any
}): Promise<PaginatedResult<Category>> {
  const { where, values } = query.buildWhere(filter)
  const orderBy = query.buildOrderBy(sort)
  const { offset } = query.buildPagination(page, limit)

  const items = (await sql`
    SELECT id, name, slug, description, image_url, created_at, updated_at
    FROM categories
    ${sql.unsafe(where)}
    ${sql.unsafe(orderBy)}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as Category[]

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM categories ${sql.unsafe(where)}
  `) as { count: number }[]

  return {
    items,
    total: count,
    page,
    limit,
  }
}