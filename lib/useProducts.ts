"use client"
import useSWR from "swr"
import type { Product } from "@/lib/db"

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
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProducts(options: UseProductsOptions = {}) {
  const params = new URLSearchParams()

  if (options.room_type) params.append("room_type", options.room_type)
  if (options.category) params.append("category", options.category)
  if (options.is_featured) params.append("is_featured", "true")
  if (options.limit) params.append("limit", options.limit.toString())
  if (options.sort) params.append("sort", options.sort)

  const { data, error, isLoading } = useSWR<ProductsResponse>(`/api/products?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  })

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
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
