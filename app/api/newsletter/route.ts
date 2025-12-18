import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { NewsletterSchema, sanitizeInput } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/request"

export const runtime = "edge"

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`newsletter_${ip}`, {
      interval: 300000, // 5 minutes
      maxRequests: 2,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many subscription attempts" }, { status: 429 })
    }

    const body = await request.json()
    const validatedData = NewsletterSchema.parse(body)

    const email = sanitizeInput(validatedData.email)

    // Check if email already exists
    const existing = await sql`SELECT id FROM newsletter_subscribers WHERE email = ${email}`

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already subscribed" }, { status: 409 })
    }

    // Insert new subscriber
    await sql`INSERT INTO newsletter_subscribers (email) VALUES (${email})`

    return NextResponse.json({ message: "Successfully subscribed to newsletter" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error subscribing to newsletter:", error)

    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
