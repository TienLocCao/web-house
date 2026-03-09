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

import type { GalleryItem } from "@/lib/types/media"

export type ProductFormState = {
  name: string
  slug: string
  category: any // TODO: import Category type if needed
  category_id: string
  room_type: string
  price: string
  stock: string
  is_featured: boolean
  is_available: boolean
  image_url: string
  gallery: GalleryItem[]
  description: string
}