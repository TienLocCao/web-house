import { z } from "zod"

export const CategoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
})

export const CategoryUpdateSchema = CategoryCreateSchema.partial()

export type CategoryCreate = z.infer<typeof CategoryCreateSchema>
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>