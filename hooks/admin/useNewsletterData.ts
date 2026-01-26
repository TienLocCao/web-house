/**
 * Hook for managing newsletter data fetching
 */

"use client"

import { useEffect, useState } from "react"
import { secureFetchJSON } from "@/lib/utils"
import type { NewsletterSubscriber } from "@/lib/types/newsletter"
import type { SortItem } from "@/lib/types/table"

interface UseNewsletterDataProps {
  page: number
  limit: number
  sort: SortItem[]
  refreshKey?: number
}

interface UseNewsletterDataReturn {
  data: NewsletterSubscriber[]
  total: number
  isLoading: boolean
}

export function useNewsletterData({
  page,
  limit,
  sort,
  refreshKey,
}: UseNewsletterDataProps): UseNewsletterDataReturn {
  const [data, setData] = useState<NewsletterSubscriber[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setIsLoading(true)
      try {
        const json: { items: NewsletterSubscriber[]; total: number } = await secureFetchJSON(
          `/api/admin/newsletter?page=${page}&limit=${limit}&sort=${encodeURIComponent(
            JSON.stringify(sort)
          )}`
        )

        if (!ignore) {
          setData(json.items)
          setTotal(json.total)
        }
      } catch (err) {
        console.error("[useNewsletterData] Fetch error:", err)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      ignore = true
    }
  }, [page, limit, sort, refreshKey])

  return { data, total, isLoading }
}
