import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatVND } from "@/lib/utils"
import type { Product } from "@/lib/db"
import { Star, ShoppingBag, ChevronRight } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.original_price
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 animate-fade-in-up">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Top Badges: Discount & Status */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {discount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground font-bold shadow-md border-none px-3 py-1">
              -{discount}%
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-primary text-primary-foreground shadow-md backdrop-blur-sm border-none px-3 py-1">
              Featured
            </Badge>
          )}
        </div>

        {/* Bottom Badge: Category */}
        <div className="absolute bottom-4 left-4 z-10 transition-transform duration-300 group-hover:-translate-y-1">
          <Badge variant="secondary" className="text-xs font-medium tracking-wide bg-background/90 backdrop-blur-md text-foreground border-none shadow-sm px-3 py-1">
            {product.category_name || "Home Decor"}
          </Badge>
        </div>
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-grow relative">
        {/* Title */}
        <h3 className="font-serif font-bold text-lg md:text-xl line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">
          {product.name}
        </h3>

        {/* Price & Rating Section */}
        <div className="space-y-3 mb-4 flex-grow">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatVND(Number(product.price))}
            </span>
            {product.original_price && (
              <span className="text-sm text-muted-foreground line-through font-medium">
                {formatVND(Number(product.original_price))}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="ml-1.5 font-semibold leading-none">{Number(product.rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground text-xs leading-none relative top-[1px]">
              ({product.review_count || 0} reviews)
            </span>
          </div>
        </div>

        {/* Footer Actions & Stock */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/60">
          <div className="text-xs md:text-sm font-medium">
            {Number(product.stock) < 10 && Number(product.stock) > 0 ? (
              <span className="text-amber-600 flex items-center gap-1.5">
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Only {product.stock} left
              </span>
            ) : Number(product.stock) === 0 ? (
              <span className="text-destructive flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive"></span>
                Out of stock
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                In stock
              </span>
            )}
          </div>
          
          {/* CTA Link */}
          <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 font-semibold">
            Details <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

