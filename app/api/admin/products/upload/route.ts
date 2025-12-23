import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import { requireAuth } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    await requireAuth()

    const form = await req.formData()
    const file = form.get("image") as File | null
    if (!file)
      return NextResponse.json(
        { message: "Validation failed", errors: [{ path: "image", message: "No file uploaded" }] },
        { status: 400 }
      )

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    const fileType = (file as any).type
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { message: "Validation failed", errors: [{ path: "image", message: "Invalid file type" }] },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const maxBytes = 5 * 1024 * 1024 // 5 MB
    if (buffer.length > maxBytes) {
      return NextResponse.json(
        { message: "Validation failed", errors: [{ path: "image", message: "File is too large (max 5MB)" }] },
        { status: 400 }
      )
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products")
    await fs.mkdir(uploadsDir, { recursive: true })

    const originalName = (file as any).name || `upload-${Date.now()}`
    let ext = path.extname(originalName)
    if (!ext && fileType) ext = "." + fileType.split("/")[1]

    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`
    const dest = path.join(uploadsDir, safeName)

    await fs.writeFile(dest, buffer)

    const imageUrl = `/uploads/products/${safeName}`
    return NextResponse.json({ image_url: imageUrl }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
