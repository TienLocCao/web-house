/**
 * Hook for managing review actions with state and side effects
 * Combines API calls with UI interactions and router refresh
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import {
  approveReview,
  deleteReview,
  bulkApproveReviews,
  bulkDeleteReviews,
} from "@/lib/api/admin/reviews"

type ReviewActionState = {
  isLoading: boolean
  error: string | null
}

interface UseReviewActionsReturn {
  isLoading: boolean
  error: string | null
  handleApprove: (reviewId: number) => Promise<void>
  handleDelete: (reviewId: number) => Promise<void>
  handleBulkApprove: (reviewIds: number[]) => Promise<void>
  handleBulkDelete: (reviewIds: number[]) => Promise<void>
  clearError: () => void
}

/**
 * Hook for handling review approval/deletion actions
 * Manages loading states, error handling, and router refresh
 */
export function useReviewActions(): UseReviewActionsReturn {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<ReviewActionState>({
    isLoading: false,
    error: null,
  })

  const clearError = () => setState((prev) => ({ ...prev, error: null }))

  const handleApprove = async (reviewId: number) => {
    setState({ isLoading: true, error: null })
    try {
      const response = await approveReview(reviewId)

      if (response.success) {
        toast({
          title: response.message || "Review approved",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to approve review"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useReviewActions] Approve error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    setState({ isLoading: true, error: null })
    try {
      const response = await deleteReview(reviewId)

      if (response.success) {
        toast({
          title: response.message || "Review deleted",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete review"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useReviewActions] Delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleBulkApprove = async (reviewIds: number[]) => {
    setState({ isLoading: true, error: null })
    try {
      const response = await bulkApproveReviews(reviewIds)

      if (response.success) {
        toast({
          title: response.message || `${reviewIds.length} reviews approved`,
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to approve reviews"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useReviewActions] Bulk approve error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleBulkDelete = async (reviewIds: number[]) => {
    if (!confirm(`Are you sure you want to delete ${reviewIds.length} reviews?`)) return

    setState({ isLoading: true, error: null })
    try {
      const response = await bulkDeleteReviews(reviewIds)

      if (response.success) {
        toast({
          title: response.message || `${reviewIds.length} reviews deleted`,
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete reviews"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useReviewActions] Bulk delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    handleApprove,
    handleDelete,
    handleBulkApprove,
    handleBulkDelete,
    clearError,
  }
}
