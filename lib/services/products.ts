import { sql } from "@/lib/db"
import query from "@/lib/db/query"
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
  const where = query.buildWhere(filter, { alias: "p" })
  const orderBy = query.buildOrderBy(sort, { alias: "p", categoryAlias: "c" })
  const { offset } = query.buildPagination(page, limit)
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
      p.room_type,
      p.category_id AS category_id,
      c.name AS category_name,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${where}
    ${orderBy ? sql.unsafe(orderBy) : sql``}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as Product[]

  // ===== COUNT QUERY =====
  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
     ${where}
  `) as { count: number }[]

  return {
    items,
    total: count,
    page,
    limit,
  }
}
