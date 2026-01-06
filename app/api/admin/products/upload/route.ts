import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import { withAdminAuth } from "@/lib/admin-api"

export const runtime = "nodejs"

export const POST = (req: NextRequest) =>
  withAdminAuth(req, async (admin) => {
    if (!["super_admin", "admin"].includes(admin.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }
    try {
      const form = await req.formData()
    const file = form.get("image") as File | null
    const oldImageUrl = form.get("old_image_url") as string | null

    if (!file) {
      return NextResponse.json(
        { errors: [{ path: "image", message: "No file uploaded" }] },
        { status: 400 }
      )
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { errors: [{ path: "image", message: "Invalid file type" }] },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { errors: [{ path: "image", message: "File too large (max 5MB)" }] },
        { status: 400 }
      )
    }

    // ===== save new image =====
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products")
    await fs.mkdir(uploadsDir, { recursive: true })

    const ext = path.extname((file as any).name || "") || "." + file.type.split("/")[1]
    const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`
    const dest = path.join(uploadsDir, fileName)

    await fs.writeFile(dest, buffer)

    // ===== delete old image (SAFE) =====
    if (oldImageUrl && oldImageUrl.startsWith("/uploads/products/")) {
      const oldPath = path.join(process.cwd(), "public", oldImageUrl)

      try {
        await fs.unlink(oldPath)
      } catch {
        // không crash nếu file cũ không tồn tại
      }
    }

      return NextResponse.json(
        { image_url: `/uploads/products/${fileName}` },
        { status: 201 }
      )
    } catch (err) {
      console.error(err)
      return NextResponse.json({ message: "Upload failed" }, { status: 500 })
    }
  })
