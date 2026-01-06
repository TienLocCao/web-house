// Database model types
export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number | null
  category_id: number | null
  room_type: string
  image_url: string
  gallery: string[]
  stock: number
  is_featured: boolean
  is_available: boolean
  dimensions: Record<string, string> | null
  material: string | null
  color: string | null
  rating: number
  review_count: number
  created_at: Date
  updated_at: Date
}

export interface Project {
  id: number
  title: string
  slug: string
  description: string | null
  client_name: string | null
  location: string | null
  image_url: string
  gallery: string[]
  room_type: string | null
  status: string
  completion_date: Date | null
  budget: number | null
  featured: boolean
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: Date
  updated_at: Date
}

export interface Review {
  id: number
  product_id: number
  customer_name: string
  email: string
  rating: number
  title: string | null
  comment: string | null
  is_verified: boolean
  is_approved: boolean
  created_at: Date
  updated_at: Date
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: Record<string, string>
  billing_address: Record<string, string> | null
  total_amount: number
  status: string
  payment_method: string | null
  payment_status: string
  notes: string | null
  created_at: Date
  updated_at: Date
}