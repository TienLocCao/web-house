import { sql } from "@/lib/db"
import type { Review } from "@/lib/types/review"

export async function getReviews(): Promise<Review[]> {
  const rows = await sql`
    SELECT 
      r.id,
      r.product_id,
      p.name AS product_name,
      p.slug AS product_slug,
      r.customer_name,
      r.email,
      r.rating,
      r.title,
      r.comment,
      r.is_verified,
      r.is_approved,
      r.created_at
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
  `

  return rows.map((r: any): Review => ({
    id: Number(r.id),
    product_id: Number(r.product_id),
    product_name: String(r.product_name),
    product_slug: String(r.product_slug),
    customer_name: String(r.customer_name),
    email: String(r.email),
    rating: Number(r.rating),
    title: r.title ?? null,
    comment: r.comment ?? null,
    is_verified: Boolean(r.is_verified),
    is_approved: Boolean(r.is_approved),
    created_at: String(r.created_at),
  }))
}
