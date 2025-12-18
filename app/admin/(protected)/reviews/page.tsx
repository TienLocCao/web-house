import type { Metadata } from "next"
import { sql } from "@/lib/db"
import { ReviewsTable } from "@/components/reviews-table"
import { getReviews } from "@/lib/services/reviews"
export const metadata: Metadata = {
  title: "Reviews | Admin",
  description: "Manage product reviews",
}

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  const reviews = await getReviews()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Reviews</h1>
        <p className="text-neutral-600 mt-1">Moderate and manage customer reviews</p>
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  )
}
