import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ReviewCreateSchema, sanitizeInput } from "@/lib/utils"
import { rateLimit, getClientIP } from "@/lib/middleware"

export const runtime = "edge"

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`review_${ip}`, {
      interval: 3600000, // 1 hour
      maxRequests: 5,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many reviews submitted" }, { status: 429 })
    }

    const body = await request.json()
    const validatedData = ReviewCreateSchema.parse(body)

    // Sanitize inputs
    const sanitizedData = {
      product_id: validatedData.product_id,
      customer_name: sanitizeInput(validatedData.customer_name),
      email: sanitizeInput(validatedData.email),
      rating: validatedData.rating,
      title: validatedData.title ? sanitizeInput(validatedData.title) : null,
      comment: validatedData.comment ? sanitizeInput(validatedData.comment) : null,
    }

    // Check if product exists
    const product = await sql`SELECT id FROM products WHERE id = ${sanitizedData.product_id}`

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Insert review (will need approval before showing)
    await sql
      `
      INSERT INTO reviews (product_id, customer_name, email, rating, title, comment, is_approved)
      VALUES (${sanitizedData.product_id}, ${sanitizedData.customer_name}, ${sanitizedData.email}, ${sanitizedData.rating}, ${sanitizedData.title}, ${sanitizedData.comment}, false)
      `

    return NextResponse.json({ message: "Review submitted successfully and pending approval" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating review:", error)

    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
