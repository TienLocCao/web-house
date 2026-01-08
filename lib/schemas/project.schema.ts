import { z } from "zod"

export const ProjectStatusEnum = z.enum(["completed", "in_progress", "planned"])

export const ProjectCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  client_name: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  image_url: z.string().min(1),
  gallery: z.array(z.string()).optional().default([]),
  room_type: z.string().optional().nullable(),
  status: ProjectStatusEnum.optional().default("completed"),
  completion_date: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  featured: z.boolean().optional().default(false),
})

export const ProjectUpdateSchema = ProjectCreateSchema.partial()

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>