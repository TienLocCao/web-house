import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"
import { createSession } from "@/lib/auth"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getClientIP } from "@/lib/request"

export const runtime = "nodejs"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// POST /api/admin/auth/login
export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for login attempts
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`admin_login_${ip}`, {
      interval: 900000, // 15 minutes
      maxRequests: 5,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { email, password } = LoginSchema.parse(body)

    // Get admin user
    const [admin] = await sql
      `
      SELECT id, email, password_hash, name, role, is_active
      FROM admin_users
      WHERE email = ${email.toLowerCase()}
    `
      
    

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!admin.is_active) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 })
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    const userAgent = request.headers.get("user-agent") || undefined
    await createSession(admin.id, ip, userAgent)

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("[v0] Admin login error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}


// async function createAdmin() {
//   const email = "admin2@laroastudio.com";
//   const password = "Admin123!";
//   const name = "System Administrator";
//   const role = "super_admin";

//   const password_hash = await bcrypt.hash(password, 12);

//   await sql`
//     INSERT INTO admin_users (email, password_hash, name, role, is_active)
//     VALUES (${email}, ${password_hash}, ${name}, ${role}, true)
//     ON CONFLICT (email) DO UPDATE
//     SET password_hash = EXCLUDED.password_hash
//   `;

//   console.log("Admin created/updated successfully!");
// }