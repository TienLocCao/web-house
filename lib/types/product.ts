export interface Product {
  id: number
  name: string
  slug: string
  room_type: string
  category_name: string
  price: number
  stock: number
  is_featured: boolean
  is_available: boolean
  image_url: string
}