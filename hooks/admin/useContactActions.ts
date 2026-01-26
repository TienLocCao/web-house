/**
 * Hook for managing contact actions
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import {
  deleteContact,
  updateContactStatus,
} from "@/lib/api/admin/contacts"

type ContactActionState = {
  isLoading: boolean
  error: string | null
}

export function useContactActions() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<ContactActionState>({
    isLoading: false,
    error: null,
  })

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    setState({ isLoading: true, error: null })
    try {
      const response = await deleteContact(id)

      if (response.success) {
        toast({
          title: response.message || "Contact deleted",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete contact"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useContactActions] Delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    setState({ isLoading: true, error: null })
    try {
      const response = await updateContactStatus(id, status)

      if (response.success) {
        toast({
          title: response.message || "Contact updated",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to update contact"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useContactActions] Status change error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    handleDelete,
    handleStatusChange,
  }
}
