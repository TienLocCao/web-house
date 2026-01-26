"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { secureFetchJSON } from "@/lib/utils"

export type Category = {
  id: number
  name: string
}

export function useCategories() {
  const [values, setValues] = useState<Category[]>([])
  const [pinned, setPinned] = useState<Category | null>(null)

  const [page, setPage] = useState(1)
  const limit = 10
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchCategories = useCallback(
    async (opts?: { reset?: boolean; q?: string }) => {
      if (isLoading) return
      setIsLoading(true)

      const nextPage = opts?.reset ? 1 : page
      const keyword = opts?.q ?? search

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(limit),
        })
        if (keyword) params.set("q", keyword)

        const res = await fetch(`/api/admin/categories?${params}`)
        const json = await res.json()
        const data: Category[] = json.items ?? []

        setValues(prev =>
          nextPage === 1 ? data : [...prev, ...data]
        )
        setHasMore(json.limit * json.page < json.total)
        setPage(nextPage + 1)
      } finally {
        setIsLoading(false)
      }
    },
    [page, search, isLoading]
  )

  useEffect(() => {
    fetchCategories({ reset: true })
  }, [])

  const searchCategories = useCallback(
    (q: string) => {
      setSearch(q)
      setPage(1)
      setHasMore(true)
      fetchCategories({ reset: true, q })
    },
    [fetchCategories]
  )

  /** ⭐ PIN CATEGORY */
  const ensureCategory = useCallback((category?: Category | null) => {
    if (!category?.id) return
    setPinned(category)
  }, [])

  /** ⭐ MERGE PINNED + OPTIONS */
  const mergedValues = pinned
    ? [pinned, ...values.filter(v => v.id !== pinned.id)]
    : values

  return {
    values: mergedValues,
    isLoading,
    hasMore,
    loadMore: () => hasMore && !isLoading && fetchCategories(),
    searchCategories,
    ensureCategory,
  }
}
