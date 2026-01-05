import type { Metadata } from "next"
import { getOrders } from "@/lib/services/orders"
import OrdersClient from "@/components/admin/orders/client"

export const metadata: Metadata = {
  title: "Orders | Admin",
  description: "Manage orders",
}

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const { items, total } = await getOrders({ page: 1, limit: 10 })

  return (
    <OrdersClient
      initialData={items}
      initialTotal={total}
    />
  )
}
