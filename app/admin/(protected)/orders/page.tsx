import type { Metadata } from "next"
import { sql } from "@/lib/db"
import { OrdersTable } from "@/components/OrdersTable"
import { getOrders } from "@/lib/services/orders"

export const metadata: Metadata = {
  title: "Orders | Admin",
  description: "Manage orders",
}

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Orders</h1>
        <p className="text-neutral-600 mt-1">Manage customer orders and fulfillment</p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}
