import { z } from "zod"

// Product validation schemas
export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  room_type: z.enum(["living_room", "dining_room", "bedroom", "kitchen", "bathroom", "office"]).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  is_featured: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(12),
  offset: z.number().min(0).default(0),
  sort: z.enum(["price_asc", "price_desc", "rating", "newest"]).default("newest"),
})

export const ProductCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().min(0),
  original_price: z.number().min(0).optional(),
  category_id: z.number().optional(),
  room_type: z.enum(["living_room", "dining_room", "bedroom", "kitchen", "bathroom", "office"]),
  image_url: z.string().url(),
  stock: z.number().min(0).default(0),
  is_featured: z.boolean().default(false),
})

// Review validation schemas
export const ReviewCreateSchema = z.object({
  product_id: z.number(),
  customer_name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  rating: z.number().min(1).max(5),
  title: z.string().max(255).optional(),
  comment: z.string().optional(),
})

// Contact form validation
export const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().max(50).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

// Newsletter subscription validation
export const NewsletterSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
})

// Order validation
export const OrderCreateSchema = z.object({
  customer_name: z.string().min(1).max(255),
  customer_email: z.string().email().max(255),
  customer_phone: z.string().max(50).optional(),
  shipping_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z
    .array(
      z.object({
        product_id: z.number(),
        quantity: z.number().min(1),
      }),
    )
    .min(1),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
})

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim()
}

// Rate limiting helper
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}
