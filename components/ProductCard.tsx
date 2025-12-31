import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/db"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
        <Image
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">-{discount}%</Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">${Number(product.original_price).toFixed(2)}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="ml-1">{Number(product.rating).toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">({product.review_count} reviews)</span>
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="text-sm text-orange-500">Only {product.stock} left in stock</p>
        )}
        {product.stock === 0 && <p className="text-sm text-destructive">Out of stock</p>}
      </div>
    </Link>
  )
}
