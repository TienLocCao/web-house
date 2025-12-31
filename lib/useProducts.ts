"use client"
import useSWR from "swr"
import type { Product } from "@/lib/db"
import useSWRInfinite from "swr/infinite"

interface ProductsResponse {
  data: Product[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface UseProductsOptions {
  room_type?: string
  category?: string
  is_featured?: boolean
  limit?: number
  sort?: string
  query?: string
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  })

export function useProducts(options: UseProductsOptions = {}) {
  const limit = options.limit ?? 12

  const getKey = (pageIndex: number, previousPageData: ProductsResponse | null) => {
    if (previousPageData && !previousPageData.pagination.hasMore) {
      return null
    }

    const params = new URLSearchParams()

    params.set("limit", limit.toString())
    params.set("offset", (pageIndex * limit).toString())

    if (options.room_type) params.set("room_type", options.room_type)
    if (options.category) params.set("category", options.category)
    if (options.is_featured) params.set("is_featured", "true")
    if (options.sort) params.set("sort", options.sort)
    if (options.query) params.set("query", options.query)

    return `/api/products?${params.toString()}`
  }

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite<ProductsResponse>(getKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const products = data ? data.flatMap((page) => page.data) : []

  const lastPage = data?.[data.length - 1]

  return {
    products,
    total: lastPage?.pagination.total ?? 0,
    isLoading,
    isValidating,
    isError: error,
    hasMore: lastPage?.pagination.hasMore ?? false,
    loadMore: () => setSize(size + 1),
  }
}
export function useProduct(slug: string) {
  const { data, error, isLoading } = useSWR<{
    product: Product
    relatedProducts: Product[]
    reviews: any[]
  }>(slug ? `/api/products/${slug}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    product: data?.product,
    relatedProducts: data?.relatedProducts || [],
    reviews: data?.reviews || [],
    isLoading,
    isError: error,
  }
}
