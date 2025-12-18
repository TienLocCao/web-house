export type Review = {
  id: number
  product_id: number
  product_name: string
  product_slug: string
  customer_name: string
  email: string
  rating: number
  title: string | null
  comment: string | null
  is_verified: boolean
  is_approved: boolean
  created_at: string
}
