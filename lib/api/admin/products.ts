/**
 * Pure API layer for products
 * Handles all API calls related to products management
 */

import { secureFetchJSON } from "@/lib/utils"
import type { Product } from "@/lib/types/product"

export type ProductResponse = {
  success: boolean
  message?: string
  error?: string
  items?: Product[]
  total?: number
}

export const deleteProduct = async (id: number): Promise<ProductResponse> => {
  return secureFetchJSON<ProductResponse>(`/api/admin/products/${id}`, {
    method: "DELETE",
  })
}

export const toggleProductAvailability = async (id: number, isAvailable: boolean): Promise<ProductResponse> => {
  return secureFetchJSON<ProductResponse>(`/api/admin/products/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ is_available: isAvailable }),
  })
}

export const bulkDeleteProducts = async (ids: number[]): Promise<ProductResponse> => {
  return secureFetchJSON<ProductResponse>(`/api/admin/products/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  })
}
