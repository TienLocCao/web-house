export interface Project {
  id: number
  title: string
  slug: string
  description?: string | null
  client_name?: string | null
  location?: string | null
  image_url: string
  gallery?: string[]
  room_type?: string | null
  status?: string
  completion_date?: string | null
  budget?: number | null
  featured?: boolean
  created_at?: string
  updated_at?: string
}