import { sql } from "@/lib/db"
import type { Order } from "@/lib/types/order"

export async function getOrders(): Promise<Order[]> {
  const rows = await sql`
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
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `

  return rows.map((r: any): Order => ({
    id: Number(r.id),
    order_number: String(r.order_number),
    customer_name: String(r.customer_name),
    customer_email: String(r.customer_email),
    total_amount: Number(r.total_amount),
    status: String(r.status),
    payment_status: String(r.payment_status),
    item_count: Number(r.item_count),
    created_at: String(r.created_at),
  }))
}
