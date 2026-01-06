"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebounce } from "./useDebounce"

export interface UseAdminFiltersOptions {
  searchParamKey?: string
  debounceDelay?: number
  initialSearch?: string
}

export interface UseAdminFiltersReturn {
  searchQuery: string
  setSearchQuery: (value: string) => void
  debouncedSearch: string
  clearFilters: () => void
  hasActiveFilters: boolean
  updateUrl: (params: Record<string, string | undefined>) => void
}

export function useAdminFilters(
  options: UseAdminFiltersOptions = {}
): UseAdminFiltersReturn {
  const {
    searchParamKey = "query",
    debounceDelay = 300,
    initialSearch,
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlSearch = searchParams.get(searchParamKey) || ""
  const [searchQuery, setSearchQuery] = useState(initialSearch || urlSearch)
  const debouncedSearch = useDebounce(searchQuery, debounceDelay)

  // Sync search query with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedSearch) {
      params.set(searchParamKey, debouncedSearch)
    } else {
      params.delete(searchParamKey)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [debouncedSearch, pathname, router, searchParams, searchParamKey])

  // Sync URL changes back to state (only on mount or when URL changes externally)
  useEffect(() => {
    if (urlSearch !== searchQuery && !debouncedSearch) {
      setSearchQuery(urlSearch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    router.push(pathname, { scroll: false })
  }, [pathname, router])

  const updateUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams)
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "all") {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  // Check if there are any active filters
  const hasActiveFilters = Boolean(debouncedSearch)

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    clearFilters,
    hasActiveFilters,
    updateUrl,
  }
}


