import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/3] rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}