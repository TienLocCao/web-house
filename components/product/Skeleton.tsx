import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailSkeleton() {
  return (
    <section className="pt-28 pb-14 lg:pt-32 lg:pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Product Detail */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20 lg:mb-24">
          {/* Images */}
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:space-y-8">
            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-4/5" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            {/* Price box */}
            <Skeleton className="h-20 w-full rounded-lg" />

            {/* Description */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="my-4">
              <Skeleton className="h-px w-full" />
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </div>

            <div className="my-4">
              <Skeleton className="h-px w-full" />
            </div>

            {/* Quantity + actions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-lg" />
                <Skeleton className="h-12 w-24 rounded-lg" />
                <Skeleton className="h-12 w-24 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-20 lg:mb-24">
          <Skeleton className="h-8 w-56 mb-6" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <Skeleton className="h-8 w-56 mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}