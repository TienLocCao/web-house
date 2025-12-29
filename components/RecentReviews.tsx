import { sql } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"

export async function RecentReviews() {
  const reviews = await sql`
    SELECT r.id, r.customer_name, r.rating, r.comment, r.is_approved, r.created_at, p.name as product_name
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
    LIMIT 5
  `

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Reviews</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/reviews" className="gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{review.customer_name}</p>
                  <p className="text-xs text-neutral-600 truncate">{review.product_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && <p className="text-sm text-neutral-700 line-clamp-2">{review.comment}</p>}
              {!review.is_approved && (
                <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Pending Approval
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
