import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ContactFormSchema, sanitizeInput } from "@/lib/utils"
import { rateLimit, getClientIP } from "@/lib/middleware"

export const runtime = "edge"

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for form submissions
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`contact_${ip}`, {
      interval: 300000, // 5 minutes
      maxRequests: 3, // Only 3 submissions per 5 minutes
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = ContactFormSchema.parse(body)

    // Sanitize inputs to prevent XSS
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: sanitizeInput(validatedData.email),
      phone: validatedData.phone ? sanitizeInput(validatedData.phone) : null,
      subject: validatedData.subject ? sanitizeInput(validatedData.subject) : null,
      message: sanitizeInput(validatedData.message),
    }

    // Insert into database using parameterized query
    await sql
      `
      INSERT INTO contact_inquiries (name, email, phone, subject, message)
      VALUES (${sanitizedData.name}, ${sanitizedData.email}, ${sanitizedData.phone}, ${sanitizedData.subject}, ${sanitizedData.message})
      `

    return NextResponse.json({ message: "Contact form submitted successfully" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error submitting contact form:", error)

    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid form data", details: error }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
  }
}
