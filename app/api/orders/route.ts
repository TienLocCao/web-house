import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { OrderCreateSchema, sanitizeInput } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/request"

export const runtime = "edge"

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for orders
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`order_${ip}`, {
      interval: 3600000, // 1 hour
      maxRequests: 10,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many order attempts" }, { status: 429 })
    }

    const body = await request.json()
    const validatedData = OrderCreateSchema.parse(body)

    // Sanitize inputs
    const sanitizedData = {
      customer_name: sanitizeInput(validatedData.customer_name),
      customer_email: sanitizeInput(validatedData.customer_email),
      customer_phone: validatedData.customer_phone ? sanitizeInput(validatedData.customer_phone) : null,
      shipping_address: validatedData.shipping_address,
      items: validatedData.items,
      payment_method: validatedData.payment_method,
      notes: validatedData.notes ? sanitizeInput(validatedData.notes) : null,
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Calculate total amount by fetching product prices
    let totalAmount = 0
    const orderItems = []

    for (const item of sanitizedData.items) {
      const [product] = await sql`SELECT id, name, price, stock FROM products WHERE id = ${item.product_id}`

      if (!product) {
        return NextResponse.json({ error: `Product with ID ${item.product_id} not found` }, { status: 404 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 })
      }

      const itemTotal = Number(product.price) * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: Number(product.price),
        total_price: itemTotal,
      })
    }

    // Start transaction - insert order and order items
    const [order] = await sql
      `
      INSERT INTO orders 
        (order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method, notes)
      VALUES (${orderNumber}, ${sanitizedData.customer_name}, ${sanitizedData.customer_email}, ${sanitizedData.customer_phone}, ${JSON.stringify(sanitizedData.shipping_address)}, ${totalAmount}, ${sanitizedData.payment_method}, ${sanitizedData.notes})
      RETURNING *
      `

    // Insert order items
    for (const item of orderItems) {
      await sql
        `
        INSERT INTO order_items 
          (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.unit_price}, ${item.total_price})
        `

      // Update product stock
      await sql
        `
        UPDATE products 
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.product_id}
        `
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          status: order.status,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating order:", error)

    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid order data", details: error }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
