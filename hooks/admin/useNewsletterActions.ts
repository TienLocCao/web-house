/**
 * Hook for managing newsletter actions
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import {
  deleteNewsletter,
  toggleNewsletter,
  bulkDeleteNewsletter,
} from "@/lib/api/admin/newsletter"

type NewsletterActionState = {
  isLoading: boolean
  error: string | null
}

export function useNewsletterActions() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<NewsletterActionState>({
    isLoading: false,
    error: null,
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return

    setState({ isLoading: true, error: null })
    try {
      const response = await deleteNewsletter(id)

      if (response.success) {
        toast({
          title: response.message || "Subscriber deleted",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete subscriber"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useNewsletterActions] Delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    setState({ isLoading: true, error: null })
    try {
      const response = await toggleNewsletter(id, isActive)

      if (response.success) {
        toast({
          title: response.message || "Subscriber updated",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to update subscriber"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useNewsletterActions] Toggle error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleBulkDelete = async (ids: string[], mode: string) => {
    const isDeleteAll = mode === "all"
    if (!confirm(`Delete ${isDeleteAll ? "all" : ids.length} subscriber(s)?`)) return

    setState({ isLoading: true, error: null })
    try {
      const response = await bulkDeleteNewsletter(ids, mode)

      if (response.success) {
        toast({
          title: response.message || "Subscribers deleted",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete subscribers"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useNewsletterActions] Bulk delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    handleDelete,
    handleToggle,
    handleBulkDelete,
  }
}
