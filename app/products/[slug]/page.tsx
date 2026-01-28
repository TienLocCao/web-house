"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/shop/ProductCard"
import { AddToCart } from "@/components/shop/AddToCart"
import { useProduct } from "@/lib/hooks"
import { formatVND } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Share2 } from "lucide-react"
import { ProductDetailSkeleton } from "@/components/product/Skeleton"

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { product, relatedProducts, reviews, isLoading, isError } = useProduct(slug)

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <ProductDetailSkeleton />
        <Footer />
      </main>
    )
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">The product you're looking for doesn't exist</p>
        </div>
      </div>
    )
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Product Detail */}
          <div className="grid lg:grid-cols-2 gap-12 mb-24">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-4 py-2">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div className="mb-2">
                <Badge className="mb-1 text-sm px-3 py-1">{product.room_type.replace("_", " ").toUpperCase()}</Badge>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-semibold text-lg">{Number(product.rating).toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">({product.review_count} reviews)</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">SKU: {product.id}</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg px-6 py-3 mb-3">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-3xl lg:text-4xl font-bold text-primary">{formatVND(Number(product.price))}</span>
                  {product.original_price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatVND(Number(product.original_price))}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        Save {formatVND(Number(product.original_price - product.price))}
                      </Badge>
                    </>
                  )}
                </div>

                {product.stock > 0 ? (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">✗ Out of Stock</p>
                )}
              </div>

              {product.description && (
                <div className="mb-2">
                  <h3 className="font-semibold text-lg mb-2">Product Description</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{product.description}</p>
                </div>
              )}

              <Separator className="mb-2" />

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                {product.material && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium mb-1">Material</span>
                    <span className="font-semibold">{product.material}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium mb-1">Color</span>
                    <span className="font-semibold">{product.color}</span>
                  </div>
                )}
                {product.dimensions && (
                  <>
                    {Object.entries(product.dimensions).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm text-muted-foreground font-medium mb-1 capitalize">{key}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <Separator className="mb-2" />

              {/* Quantity and Actions */}
              <div className="space-y-6">
                <AddToCart
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image_url: product.image_url,
                    material: product.material || 'Not specified',
                    color: product.color || 'Not specified',
                    stock: product.stock,
                  }}
                  showQuantityControl
                  size="lg"
                  className="w-full py-6 text-lg flex-1"
                />

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="sm:w-auto px-6">
                    <Heart className="mr-2 h-5 w-5" />
                    Wishlist
                  </Button>

                  <Button variant="outline" size="lg" className="sm:w-auto px-6">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✓ Free shipping on orders over $100</p>
                  <p>✓ 30-day return policy</p>
                  <p>✓ Secure checkout</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mb-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-serif font-bold">Customer Reviews</h2>
                <Button variant="outline">
                  Write a Review
                </Button>
              </div>
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-xl p-6 bg-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {review.customer_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{review.customer_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                            {review.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {review.title && <h4 className="font-semibold text-lg mb-2">{review.title}</h4>}
                    {review.comment && <p className="text-muted-foreground leading-relaxed">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-serif font-bold">You Might Also Like</h2>
                <Button variant="outline">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
