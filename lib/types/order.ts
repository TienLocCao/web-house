export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  status: string
  payment_status: string
  item_count: number
  created_at: string
}

export type ShippingAddress = {
  street: string
  city: string
  state: string
  zip: string
  country: string
}