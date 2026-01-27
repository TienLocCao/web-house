"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/shop/ProductCard"
import { useProducts } from "@/lib/hooks"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { Skeleton } from "@/components/ui/skeleton"

const LIMIT = 12

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sort = searchParams.get("sort") || "newest"
  const query = searchParams.get("query") || ""

  const [searchQuery, setSearchQuery] = useState(query)
  const [filterBy, setFilterBy] = useState<string[]>([])
  const debouncedQuery = useDebounce(searchQuery, 300)

  const {
    products,
    loadMore,
    hasMore,
    isLoading,
    isValidating,
    total,
  } = useProducts({
    room_type: filterBy.length > 0 ? filterBy : undefined,
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
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-muted border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold">Our Products</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover our curated selection of premium furniture and home decor pieces
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <label className="text-sm font-medium text-muted-foreground">Filter by Room:</label>
              <div className="space-y-2 mt-2">
                {[
                  { value: 'bedroom', label: 'Bedroom' },
                  { value: 'living_room', label: 'Living Room' },
                  { value: 'dining_room', label: 'Dining Room' },
                  { value: 'office', label: 'Office' },
                ].map((room) => (
                  <div key={room.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={room.value}
                      checked={filterBy.includes(room.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterBy([...filterBy, room.value])
                        } else {
                          setFilterBy(filterBy.filter(f => f !== room.value))
                        }
                      }}
                    />
                    <label htmlFor={room.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {room.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-9">
              {/* HEADER */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                <div className="flex align-center space-x-4 justify-center">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:w-[250px]"
                />
                <p className="text-muted-foreground flex items-center">
                  {products.length} products found
                </p>
                </div>

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

              

              {/* PRODUCTS */}
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </>
              ) : (
                !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No products found</p>
                  </div>
                )
              )}

              {/* FIRST LOAD */}
              {isLoading && products.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
