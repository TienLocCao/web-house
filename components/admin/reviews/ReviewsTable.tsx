"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Trash2, Star } from "lucide-react"
import type { Review } from "@/lib/types/review"
import { useReviewActions } from "@/hooks/admin/useReviewActions"

interface ReviewsTableProps {
  reviews: Review[]
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
  const [updating, setUpdating] = useState<number | null>(null)
  const { handleApprove, handleDelete, isLoading } = useReviewActions()

  const onApprove = async (reviewId: number) => {
    setUpdating(reviewId)
    await handleApprove(reviewId)
    setUpdating(null)
  }

  const onDelete = async (reviewId: number) => {
    setUpdating(reviewId)
    await handleDelete(reviewId)
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="divide-y divide-neutral-200">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 hover:bg-neutral-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`}
                      />
                    ))}
                  </div>
                  {review.is_verified && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified Purchase
                    </span>
                  )}
                  {!review.is_approved && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Pending
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <p className="font-medium text-neutral-900">{review.customer_name}</p>
                  <p className="text-sm text-neutral-600">{review.email}</p>
                </div>

                <p className="text-sm text-neutral-700 mb-2">
                  Product: <span className="font-medium">{review.product_name}</span>
                </p>

                {review.title && <p className="font-medium text-neutral-900 mb-1">{review.title}</p>}

                {review.comment && <p className="text-sm text-neutral-700 mb-2">{review.comment}</p>}

                <p className="text-xs text-neutral-500">{new Date(review.created_at).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2">
                {!review.is_approved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(review.id)}
                    disabled={updating === review.id || isLoading}
                    className="gap-2 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(review.id)}
                  disabled={updating === review.id || isLoading}
                  className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  )
}
