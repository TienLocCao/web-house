"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/ProductCard"
import { useProducts } from "@/lib/useProducts"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

const LIMIT = 12

export default function ProductsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const roomType = searchParams.get("room_type") || undefined
  const sort = searchParams.get("sort") || "newest"
  const query = searchParams.get("query") || ""

  const [searchQuery, setSearchQuery] = useState(query)
  const debouncedQuery = useDebounce(searchQuery, 300)

  const {
    products,
    loadMore,
    hasMore,
    isLoading,
    isValidating,
    total,
  } = useProducts({
    room_type: roomType,
    sort,
    query: debouncedQuery,
    limit: LIMIT,
  })

  /* ===== Sync search → URL (SEO friendly) ===== */
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    debouncedQuery
      ? params.set("query", debouncedQuery)
      : params.delete("query")

    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedQuery])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("sort", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  /* ===== Infinite scroll ===== */
  const loadMoreSafe = useCallback(() => {
    if (!hasMore || isValidating) return
    loadMore()
  }, [hasMore, isValidating, loadMore])

  const loadMoreRef = useInfiniteScroll({
    enabled: hasMore,
    onLoadMore: loadMoreSafe,
  })

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-[250px]"
            />

            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-muted-foreground mb-6">
            {total} products found
          </p>

          {/* PRODUCTS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* LOAD TRIGGER */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="h-10 flex items-center justify-center"
            >
              {isValidating && (
                <span className="text-muted-foreground text-sm">
                  Loading more products...
                </span>
              )}
            </div>
          )}

          {/* FIRST LOAD */}
          {isLoading && products.length === 0 && (
            <div className="text-center py-20">
              Loading products...
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
