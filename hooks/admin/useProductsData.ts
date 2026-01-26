/**
 * Hook for managing products data fetching
 */

"use client"

import { useEffect, useState } from "react"
import { secureFetchJSON } from "@/lib/utils"
import type { Product } from "@/lib/types/product"
import type { SortItem } from "@/lib/types/table"

interface UseProductsDataProps {
  page: number
  limit: number
  sort: SortItem[]
  search?: string
  roomType?: string
  refreshKey?: number
}

interface UseProductsDataReturn {
  data: Product[]
  total: number
  isLoading: boolean
}

export function useProductsData({
  page,
  limit,
  sort,
  search,
  roomType,
  refreshKey,
}: UseProductsDataProps): UseProductsDataReturn {
  const [data, setData] = useState<Product[]>([])
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
        
        // Build sort param
        let sortParam = "newest"
        if (sort && sort.length > 0) {
          const s = sort[0]
          sortParam = s.desc ? `${s.id}_desc` : `${s.id}_asc`
        }
        params.set("sort", sortParam)
        
        if (search) params.set("search", search)
        if (roomType) params.set("room_type", roomType)

        const json: { items: Product[]; total: number } = await secureFetchJSON(
          `/api/admin/products?${params.toString()}`
        )

        if (!ignore) {
          setData(json.items)
          setTotal(json.total)
        }
      } catch (err) {
        console.error("[useProductsData] Fetch error:", err)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      ignore = true
    }
  }, [page, limit, sort, search, roomType, refreshKey])

  return { data, total, isLoading }
}
