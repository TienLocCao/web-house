/**
 * Hook for managing projects data fetching
 */

"use client"

import { useEffect, useState } from "react"
import { secureFetchJSON } from "@/lib/utils"
import type { Project } from "@/lib/types/project"
import type { SortItem } from "@/lib/types/table"

interface UseProjectsDataProps {
  page: number
  limit: number
  sort: SortItem[]
  search?: string
  status?: string
  refreshKey?: number
}

interface UseProjectsDataReturn {
  data: Project[]
  total: number
  isLoading: boolean
}

export function useProjectsData({
  page,
  limit,
  sort,
  search,
  status,
  refreshKey,
}: UseProjectsDataProps): UseProjectsDataReturn {
  const [data, setData] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(limit))
        params.set("sort", JSON.stringify(sort))
        if (search) params.set("search", search)
        if (status) params.set("status", status)

        const json: { items: Project[]; total: number } = await secureFetchJSON(
          `/api/admin/projects?${params.toString()}`
        )

        if (!ignore) {
          setData(json.items)
          setTotal(json.total)
        }
      } catch (err) {
        console.error("[useProjectsData] Fetch error:", err)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      ignore = true
    }
  }, [page, limit, sort, search, status, refreshKey])

  return { data, total, isLoading }
}
