import { sql } from "@/lib/db"
import { buildPagination, buildOrderBy, buildWhere } from "@/lib/db/query"
import type { Product } from "@/lib/types/product"
import type { PaginatedResult } from "@/lib/types/pagination"

export async function getProducts({
  page = 1,
  limit = 5,
  sort = [],
  filter = {},
}: {
  page?: number
  limit?: number
  sort?: any[]
  filter?: any
}): Promise<PaginatedResult<Product>> {

  const { where, values } = buildWhere(filter)
  const orderBy = buildOrderBy(sort)
  const { offset } = buildPagination(page, limit)

  // ===== DATA QUERY =====
  const items = (await sql`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.price,
      p.stock,
      p.is_featured,
      p.is_available,
      p.image_url,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${sql.unsafe(where)}
    ${sql.unsafe(orderBy)}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as Product[]

  // ===== COUNT QUERY =====
  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${sql.unsafe(where)}
  `) as { count: number }[]

  return {
    items,
    total: count,
    page,
    limit,
  }
}
