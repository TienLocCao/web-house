"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types/orders"


interface OrdersTableProps {
  orders: Order[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<number | null>(null)
  const { toast } = useToast()

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdating(orderId)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({ title: "Status updated", type: "success" })
        router.refresh()
      } else {
        const json = await response.json().catch(() => null)
        toast({ title: json?.error || "Failed to update order status", type: "error" })
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast({ title: "An error occurred", type: "error" })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left text-xs font-medium text-neutral-600 uppercase tracking-wider px-6 py-3">
                Order
              </th>
              <th className="text-left text-xs font-medium text-neutral-600 uppercase tracking-wider px-6 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-medium text-neutral-600 uppercase tracking-wider px-6 py-3">
                Items
              </th>
              <th className="text-left text-xs font-medium text-neutral-600 uppercase tracking-wider px-6 py-3">
                Total
              </th>
              <th className="text-left text-xs font-medium text-neutral-600 uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-neutral-600 uppercase tracking-wider px-6 py-3">
                Date
              </th>
              <th className="text-right text-xs font-medium text-neutral-600 uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-neutral-900">{order.customer_name}</p>
                    <p className="text-sm text-neutral-600">{order.customer_email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-700">{order.item_count} items</td>
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                  ${Number(order.total_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updating === order.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-700">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}
