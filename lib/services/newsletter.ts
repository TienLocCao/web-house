import { sql } from "@/lib/db"
import query from "@/lib/db/query"
import type { NewsletterSubscriber } from "@/lib/types/newsletter"
import type { PaginatedResult } from "@/lib/types/pagination"

export async function getNewsletterSubscribers({ page = 1, limit = 10, sort = [], filter = {} }: { page?: number; limit?: number; sort?: any[]; filter?: any }): Promise<PaginatedResult<NewsletterSubscriber>> {
  const where = query.buildWhere(filter)
  const orderBy = query.buildOrderBy(sort)
  const { offset } = query.buildPagination(page, limit)

  const items = (await sql`
    SELECT id, email, subscribed_at, is_active
    FROM newsletter_subscribers
    ${where}
    ${sql.unsafe(orderBy)}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as NewsletterSubscriber[]

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM newsletter_subscribers ${where}
  `) as { count: number }[]

  return { items, total: count, page, limit }
}