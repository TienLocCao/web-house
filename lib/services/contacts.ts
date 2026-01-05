import { sql } from "@/lib/db"
import query from "@/lib/db/query"
import type { Contact } from "@/lib/types/contact"
import type { PaginatedResult } from "@/lib/types/pagination"

export async function getContacts({
  page = 1,
  limit = 5,
  sort = [],
  filter = {},
}: {
  page?: number
  limit?: number
  sort?: any[]
  filter?: any
}): Promise<PaginatedResult<Contact>> {
  const { offset } = query.buildPagination(page, limit)
  
  // Build WHERE conditions manually
  const conditions: any[] = []
  if (filter.search) {
    const search = `%${filter.search.trim()}%`
    conditions.push(sql`(
      name ILIKE ${search} OR
      email ILIKE ${search} OR
      subject ILIKE ${search} OR
      message ILIKE ${search}
    )`)
  }
  if (filter.status && filter.status !== "all") {
    conditions.push(sql`status = ${filter.status}`)
  }
  const whereClause = conditions.length > 0
    ? sql`WHERE ${conditions.reduce((acc, cur) => (acc ? sql`${acc} AND ${cur}` : cur), null as any)}`
    : sql``

  const orderBy = query.buildOrderBy(sort, { alias: "" })
  const orderByClause = orderBy ? sql.unsafe(orderBy) : sql`ORDER BY created_at DESC`

  const items = (await sql`
    SELECT
      id,
      name,
      email,
      phone,
      subject,
      message,
      status,
      created_at
    FROM contact_inquiries
    ${whereClause}
    ${orderByClause}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as any[]

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count
    FROM contact_inquiries
    ${whereClause}
  `) as { count: number }[]

  return {
    items: items.map((r: any): Contact => ({
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      phone: r.phone ?? null,
      subject: r.subject ?? null,
      message: String(r.message),
      status: r.status,
      created_at: String(r.created_at),
    })),
    total: count,
    page,
    limit,
  }
}
