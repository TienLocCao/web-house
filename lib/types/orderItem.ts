export interface OrderItem {
  id: number
  order_id: number
  product_id: number | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}