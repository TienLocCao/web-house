/**
 * Hook for managing product actions
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import {
  deleteProduct,
  toggleProductAvailability,
  bulkDeleteProducts,
} from "@/lib/api/admin/products"

type ProductActionState = {
  isLoading: boolean
  error: string | null
}

export function useProductActions() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<ProductActionState>({
    isLoading: false,
    error: null,
  })

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setState({ isLoading: true, error: null })
    try {
      const response = await deleteProduct(id)

      if (response.success) {
        toast({
          title: response.message || "Product deleted",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete product"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useProductActions] Delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleToggleAvailability = async (id: number, isAvailable: boolean) => {
    setState({ isLoading: true, error: null })
    try {
      const response = await toggleProductAvailability(id, isAvailable)

      if (response.success) {
        toast({
          title: response.message || "Product updated",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to update product"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useProductActions] Toggle error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleBulkDelete = async (ids: number[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} products?`)) return

    setState({ isLoading: true, error: null })
    try {
      const response = await bulkDeleteProducts(ids)

      if (response.success) {
        toast({
          title: response.message || `${ids.length} products deleted`,
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete products"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useProductActions] Bulk delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    handleDelete,
    handleToggleAvailability,
    handleBulkDelete,
  }
}
