import { Skeleton } from "@/components/ui/skeleton"

export function ProjectDetailSkeleton() {
  return (
    <section className="pt-28 pb-14 lg:pt-32 lg:pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20 lg:mb-24">
          {/* Images */}
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-4/5" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            <Skeleton className="h-20 w-full rounded-lg" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="my-4">
              <Skeleton className="h-px w-full" />
            </div>

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

            <div className="space-y-4">
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-20 lg:mb-24">
          <Skeleton className="h-8 w-56 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}