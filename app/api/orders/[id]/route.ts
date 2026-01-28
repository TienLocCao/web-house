import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit, getClientIP } from "@/lib/middleware"

export const runtime = "edge"

// GET /api/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rate = rateLimit(`order_${ip}`, {
      interval: 60_000,
      maxRequests: 30,
    })

    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      )
    }

    const orderId = parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 },
      )
    }

    // Get order
    const [order] = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      )
    }

    // Get order items
    const items = await sql`
      SELECT 
        oi.id,
        oi.product_id,
        oi.product_name,
        oi.quantity,
        oi.unit_price,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
      ORDER BY oi.id
    `

    // Parse shipping address
    let shippingAddress = {}
    if (order.shipping_address) {
      try {
        shippingAddress = JSON.parse(order.shipping_address)
      } catch (err) {
        console.error("Failed to parse shipping_address:", err)
      }
    }

    // Format response
    const formattedOrder = {
      id: String(order.id),
      order_number: order.order_number,
      items: items.map((item: any) => ({
        name: item.product_name,
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        image_url: item.image_url || "/placeholder.svg",
      })),
      customer: {
        firstName: order.customer_name?.split(" ")[0] || "Customer",
        lastName: order.customer_name?.split(" ").slice(1).join(" ") || "",
        email: order.customer_email,
        phone: order.customer_phone || "",
        ...shippingAddress,
      },
      payment: {
        subtotal: items.reduce(
          (sum: number, item: any) => sum + (Number(item.unit_price) * Number(item.quantity)),
          0
        ),
        shipping: order.total_amount > 5_000_000 ? 0 : 50_000,
        tax: Math.round((order.total_amount * 0.1) * 100) / 100,
        total: Number(order.total_amount),
      },
      createdAt: order.created_at,
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    )
  }
}
