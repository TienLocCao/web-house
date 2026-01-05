import { sql } from "@/lib/db"
import query from "@/lib/db/query"
import type { Order } from "@/lib/types/order"
import type { PaginatedResult } from "@/lib/types/pagination"

export async function getOrders({
  page = 1,
  limit = 5,
  sort = [],
  filter = {},
}: {
  page?: number
  limit?: number
  sort?: any[]
  filter?: any
}): Promise<PaginatedResult<Order>> {
  const { offset } = query.buildPagination(page, limit)
  
  // Build WHERE conditions manually for complex GROUP BY query
  const conditions: any[] = []
  if (filter.search) {
    const search = `%${filter.search.trim()}%`
    conditions.push(sql`(
      o.order_number ILIKE ${search} OR
      o.customer_name ILIKE ${search} OR
      o.customer_email ILIKE ${search}
    )`)
  }
  if (filter.status && filter.status !== "all") {
    conditions.push(sql`o.status = ${filter.status}`)
  }
  const whereClause = conditions.length > 0
    ? sql`WHERE ${conditions.reduce((acc, cur) => (acc ? sql`${acc} AND ${cur}` : cur), null as any)}`
    : sql``

  const orderBy = query.buildOrderBy(sort, { alias: "o" })
  const orderByClause = orderBy ? sql.unsafe(orderBy) : sql`ORDER BY o.created_at DESC`

  const items = (await sql`
    SELECT 
      o.id,
      o.order_number,
      o.customer_name,
      o.customer_email,
      o.total_amount,
      o.status,
      o.payment_status,
      o.created_at,
      COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY o.id, o.order_number, o.customer_name, o.customer_email, o.total_amount, o.status, o.payment_status, o.created_at
    ${orderByClause}
    LIMIT ${limit}
    OFFSET ${offset}
  `) as any[]

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count
    FROM (
      SELECT o.id
      FROM orders o
      ${whereClause}
      GROUP BY o.id
    ) subquery
  `) as { count: number }[]

  return {
    items: items.map((r: any): Order => ({
      id: Number(r.id),
      order_number: String(r.order_number),
      customer_name: String(r.customer_name),
      customer_email: String(r.customer_email),
      total_amount: Number(r.total_amount),
      status: String(r.status),
      payment_status: String(r.payment_status),
      item_count: Number(r.item_count),
      created_at: String(r.created_at),
    })),
    total: count,
    page,
    limit,
  }
}

export async function getOrderById(orderId: number) {
  const [row] = await sql`
    SELECT * FROM orders WHERE id = ${orderId}
  `

  if (!row) return null

  return {
    id: Number(row.id),
    order_number: String(row.order_number),
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email),
    customer_phone: row.customer_phone ?? null,
    shipping_address: row.shipping_address ? JSON.parse(String(row.shipping_address)) : null,
    billing_address: row.billing_address ? JSON.parse(String(row.billing_address)) : null,
    total_amount: Number(row.total_amount),
    status: String(row.status),
    payment_method: row.payment_method ?? null,
    payment_status: row.payment_status ?? null,
    notes: row.notes ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

import type { OrderItem } from "@/lib/types/orderItem"

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const rows = await sql`
    SELECT * FROM order_items WHERE order_id = ${orderId} ORDER BY id
  `

  return rows.map((r: any): OrderItem => ({
    id: Number(r.id),
    order_id: Number(r.order_id),
    product_id: r.product_id ? Number(r.product_id) : null,
    product_name: String(r.product_name),
    quantity: Number(r.quantity),
    unit_price: Number(r.unit_price),
    total_price: Number(r.total_price),
    created_at: String(r.created_at),
  }))
}
