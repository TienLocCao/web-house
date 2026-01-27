'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/shop/ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import type { Product } from '@/lib/db'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('latest')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=100')
        const data = await response.json()
        setProducts(data.data || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  const sortedAndFilteredProducts = () => {
    let filtered = [...products]
    
    // Apply filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(p => p.room_type === filterBy)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating)
      case 'latest':
      default:
        return filtered.reverse()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-muted border-b">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold">Shop Our Collection</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover our curated selection of premium furniture and home decor pieces
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Filters & Sorting */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <div className="flex gap-2">
                <label className="text-sm font-medium text-muted-foreground">Filter:</label>
                <select 
                  value={filterBy} 
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-background hover:border-foreground transition"
                >
                  <option value="all">All Products</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="living_room">Living Room</option>
                  <option value="dining_room">Dining Room</option>
                  <option value="office">Office</option>
                </select>
              </div>

              <div className="flex gap-2">
                <label className="text-sm font-medium text-muted-foreground">Sort:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-background hover:border-foreground transition"
                >
                  <option value="latest">Latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {sortedAndFilteredProducts().length} products
            </p>
          </div>

          {/* Products Grid */}
          {sortedAndFilteredProducts().length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedAndFilteredProducts().map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
