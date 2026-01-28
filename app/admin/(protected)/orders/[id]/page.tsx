import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Package, User, MapPin, CreditCard } from "lucide-react"
import { getOrderById, getOrderItems } from "@/lib/services/orders"
import  type { ShippingAddress } from "@/lib/types/order"
export const metadata: Metadata = {
  title: "Order Details | Admin",
  description: "View order details",
}

export const dynamic = "force-dynamic"

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const data = await params;
  const orderId = Number.parseInt(data.id)

  const order = await getOrderById(orderId)

  if (!order) notFound()

  const orderItems = await getOrderItems(orderId)

  let shippingAddress: ShippingAddress | null = null

  try {
    if (order.shipping_address) {
      shippingAddress = JSON.parse(order.shipping_address) as ShippingAddress
    }
  } catch (err) {
    console.error("Invalid shipping_address JSON", err)
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Order {order.order_number}</h1>
          <p className="text-neutral-600 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-neutral-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Order Items</h2>
            </div>

            <div className="space-y-4">
              {orderItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{item.product_name}</p>
                    <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">{formatVND(Number(item.total_price))}</p>
                    <p className="text-sm text-neutral-600">{formatVND(Number(item.unit_price))} each</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatVND(Number(order.total_amount))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-neutral-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Customer</h2>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-neutral-600">Name</p>
                <p className="font-medium text-neutral-900">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="font-medium text-neutral-900">{order.customer_email}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <p className="text-sm text-neutral-600">Phone</p>
                  <p className="font-medium text-neutral-900">{order.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-neutral-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Shipping Address</h2>
            </div>

            <div className="space-y-1 text-sm text-neutral-700">
              {shippingAddress && (
                <>
                  <p>{shippingAddress?.street}</p>
                  <p>
                    {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}
                  </p>
                  <p>{shippingAddress?.country}</p>
                </>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-neutral-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Payment</h2>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-neutral-600">Method</p>
                <p className="font-medium text-neutral-900 capitalize">{order.payment_method || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Status</p>
                <p className="font-medium text-neutral-900 capitalize">{order.payment_status}</p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Notes</h2>
              <p className="text-sm text-neutral-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
