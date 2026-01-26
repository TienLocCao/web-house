/**
 * Hook for managing contacts data fetching
 */

"use client"

import { useEffect, useState } from "react"
import { secureFetchJSON } from "@/lib/utils"
import type { Contact } from "@/lib/types/contact"

interface UseContactsDataProps {
  page: number
  limit: number
  search?: string
  status?: string
  refreshKey?: number
}

interface UseContactsDataReturn {
  data: Contact[]
  total: number
  isLoading: boolean
}

export function useContactsData({
  page,
  limit,
  search,
  status,
  refreshKey,
}: UseContactsDataProps): UseContactsDataReturn {
  const [data, setData] = useState<Contact[]>([])
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
        if (search) params.set("search", search)
        if (status) params.set("status", status)

        const json: { items: Contact[]; total: number } = await secureFetchJSON(
          `/api/admin/contacts?${params.toString()}`
        )

        if (!ignore) {
          setData(json.items)
          setTotal(json.total)
        }
      } catch (err) {
        console.error("[useContactsData] Fetch error:", err)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      ignore = true
    }
  }, [page, limit, search, status, refreshKey])

  return { data, total, isLoading }
}
