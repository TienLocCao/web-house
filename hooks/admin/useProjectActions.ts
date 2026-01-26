/**
 * Hook for managing project actions
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import {
  deleteProject,
  bulkDeleteProjects,
} from "@/lib/api/admin/projects"

type ProjectActionState = {
  isLoading: boolean
  error: string | null
}

export function useProjectActions() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<ProjectActionState>({
    isLoading: false,
    error: null,
  })

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    setState({ isLoading: true, error: null })
    try {
      const response = await deleteProject(id)

      if (response.success) {
        toast({
          title: response.message || "Project deleted",
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete project"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useProjectActions] Delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handleBulkDelete = async (ids: number[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} projects?`)) return

    setState({ isLoading: true, error: null })
    try {
      const response = await bulkDeleteProjects(ids)

      if (response.success) {
        toast({
          title: response.message || `${ids.length} projects deleted`,
          type: "success",
        })
        router.refresh()
      } else {
        const errorMsg = response.error || "Failed to delete projects"
        setState({ isLoading: false, error: errorMsg })
        toast({ title: errorMsg, type: "error" })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      setState({ isLoading: false, error: errorMsg })
      toast({ title: errorMsg, type: "error" })
      console.error("[useProjectActions] Bulk delete error:", error)
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    handleDelete,
    handleBulkDelete,
  }
}
