import { z } from "zod"

export const RoomTypeEnum = z.enum([
  "living_room",
  "dining_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "office",
])

/**
 * CREATE – POST
 */
export const ProductCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),

  description: z.string().optional().nullable(),

  price: z.number().min(1).default(0),

  original_price: z.number().positive().optional().nullable(),
  category_id: z.number().int().min(1, "Category is required"),

  room_type: RoomTypeEnum,

  image_url: z.string(),

  gallery: z.array(z.string()).optional().default([]),

  stock: z.number().int().min(0),

  is_featured: z.boolean().optional().default(false),
  is_available: z.boolean().optional().default(true),

  dimensions: z.record(z.string(), z.string()).optional().default({}),

  material: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
})

/**
 * PATCH – update từng phần
 */
export const ProductUpdateSchema = ProductCreateSchema.partial()
