/**
 * Pure API layer for newsletter
 */

import { secureFetchJSON } from "@/lib/utils"

export type NewsletterResponse = {
  success: boolean
  message?: string
  error?: string
}

export const deleteNewsletter = async (id: string): Promise<NewsletterResponse> => {
  return secureFetchJSON<NewsletterResponse>(`/api/admin/newsletter/${id}`, {
    method: "DELETE",
  })
}

export const toggleNewsletter = async (id: string, isActive: boolean): Promise<NewsletterResponse> => {
  return secureFetchJSON<NewsletterResponse>(`/api/admin/newsletter/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  })
}

export const bulkDeleteNewsletter = async (ids: string[], mode: string): Promise<NewsletterResponse> => {
  return secureFetchJSON<NewsletterResponse>(`/api/admin/newsletter/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ ids, mode }),
  })
}
