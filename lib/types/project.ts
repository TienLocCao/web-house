// lib/types/project.ts

export type ProjectStatus = "completed" | "ongoing" | "draft"

/**
 * Item trong gallery
 * upload xong → chỉ cần url
 */
export interface GalleryItem {
  id: string
  url: string
  status?: "uploading" | "done" | "error"
}

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
