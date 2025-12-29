"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/Header2"
import { Footer } from "@/components/Footer2"
import { ProductCard } from "@/components/ProductCard"
import { useProduct } from "@/lib/useProducts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { product, relatedProducts, reviews, isLoading, isError } = useProduct(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
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
            <div className="space-y-6">
              <div>
                <Badge className="mb-2">{product.room_type.replace("_", " ")}</Badge>
                <h1 className="text-4xl font-serif font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="ml-1 font-semibold">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">({product.review_count} reviews)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.original_price.toFixed(2)}
                  </span>
                )}
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.material && (
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                    <p className="font-medium">{product.material}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <p className="font-medium">{product.color}</p>
                  </div>
                )}
                {product.dimensions && (
                  <>
                    {Object.entries(product.dimensions).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                {product.stock > 0 ? (
                  <>
                    <p className="text-sm">
                      <span className="font-semibold text-green-600">In Stock</span>
                      {product.stock < 10 && ` - Only ${product.stock} left`}
                    </p>
                    <Button size="lg" className="w-full">
                      Add to Cart
                    </Button>
                  </>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Out of Stock
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mb-24">
              <h2 className="text-3xl font-serif font-bold mb-8">Customer Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-2">
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
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && <h4 className="font-semibold mb-1">{review.title}</h4>}
                    {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-serif font-bold mb-8">Related Products</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
