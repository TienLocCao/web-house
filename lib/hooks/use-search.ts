"use client"

import useSWR from "swr"

interface SearchResult {
  suggestions: string[]
  products: Array<{
    id: number
    name: string
    slug: string
    image_url: string
    price: number
  }>
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSearch(query: string, enabled = true) {
  const { data, error, isLoading } = useSWR<SearchResult>(
    enabled && query.length >= 2 ? `/api/search?q=${encodeURIComponent(query)}&limit=8` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300,
    }
  )

  return {
    suggestions: data?.suggestions || [],
    products: data?.products || [],
    isLoading,
    isError: error,
  }
}