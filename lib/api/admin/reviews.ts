/**
 * Pure API layer for reviews
 * Handles all API calls related to reviews management
 * No side effects, just data fetching/mutation
 */

import { secureFetchJSON } from "@/lib/utils"
import type { Review } from "@/lib/types/review"

// Types
export type ReviewResponse = {
  success: boolean
  message?: string
  error?: string
  data?: Review | Review[]
}

/**
 * Approve a review by ID
 * @param reviewId - The review ID to approve
 * @returns Response from the API
 */
export const approveReview = async (reviewId: number): Promise<ReviewResponse> => {
  return secureFetchJSON<ReviewResponse>(`/api/admin/reviews/${reviewId}/approve`, {
    method: "PATCH",
  })
}

/**
 * Delete/Reject a review by ID
 * @param reviewId - The review ID to delete
 * @returns Response from the API
 */
export const deleteReview = async (reviewId: number): Promise<ReviewResponse> => {
  return secureFetchJSON<ReviewResponse>(`/api/admin/reviews/${reviewId}`, {
    method: "DELETE",
  })
}

/**
 * Bulk approve reviews
 * @param reviewIds - Array of review IDs to approve
 * @returns Response from the API
 */
export const bulkApproveReviews = async (reviewIds: number[]): Promise<ReviewResponse> => {
  return secureFetchJSON<ReviewResponse>(`/api/admin/reviews/bulk/approve`, {
    method: "PATCH",
    body: JSON.stringify({ ids: reviewIds }),
  })
}

/**
 * Bulk delete reviews
 * @param reviewIds - Array of review IDs to delete
 * @returns Response from the API
 */
export const bulkDeleteReviews = async (reviewIds: number[]): Promise<ReviewResponse> => {
  return secureFetchJSON<ReviewResponse>(`/api/admin/reviews/bulk`, {
    method: "DELETE",
    body: JSON.stringify({ ids: reviewIds }),
  })
}
