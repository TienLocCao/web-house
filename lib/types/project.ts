// lib/types/project.ts

import type { GalleryItem } from "@/lib/types/media"

export type ProjectStatus = "completed" | "in_progress" | "planned"

/**
 * Project form + API payload
 * NOTE:
 * - budget để string (form) → convert number khi save DB
 */
export interface Project {
  id: number

  title: string
  slug: string
  description?: string

  client_name?: string
  location?: string

  image_url: string
  gallery?: string[] | GalleryItem[]

  room_type?: string
  status?: ProjectStatus

  completion_date?: string
  budget?: string | number

  featured: boolean
}

export type ProjectFormState = {
  title: string
  slug: string
  client_name?: string
  location?: string
  description?: string
  image_url: string
  gallery: GalleryItem[]
  room_type?: string
  status?: ProjectStatus
  completion_date?: string
  budget?: string
  featured?: boolean
}
