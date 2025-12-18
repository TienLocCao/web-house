import { sql } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function RecentOrders() {
  const orders = await sql`
    SELECT id, order_number, customer_name, total_amount, status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 5
  `

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders" className="gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{order.order_number}</p>
                <p className="text-sm text-neutral-600 truncate">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <p className="text-sm font-semibold text-neutral-900">${Number(order.total_amount).toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
