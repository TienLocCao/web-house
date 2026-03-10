import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"
import { withAdminAuth } from "@/lib/middleware"
import { deleteImageByUrl } from "@/lib/server/file-system"

export const runtime = "nodejs"

export const POST = (request: NextRequest) =>
  withAdminAuth(request, async (admin) => {
    const form = await request.formData()
  const file = form.get("image") as File | null
  const old = form.get("old_image_url") as string | null
  const folder = form.get("folder") as string | null

  if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name) || ".png"
  const name = `${crypto.randomBytes(8).toString("hex")}${ext}`
  
  // Create upload directory with optional folder subdirectory
  let uploadDir = path.join(process.cwd(), "public", "uploads")
  if (folder && /^[a-zA-Z0-9_-]+$/.test(folder)) {
    uploadDir = path.join(uploadDir, folder)
  }

  try {
    await fs.mkdir(uploadDir, { recursive: true })
    const dest = path.join(uploadDir, name)
    await fs.writeFile(dest, buffer)

    if (old) await deleteImageByUrl(old)

    const imageUrl = folder ? `/uploads/${folder}/${name}` : `/uploads/${name}`

    return NextResponse.json({ image_url: imageUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
  })

export const DELETE = (request: NextRequest) =>
  withAdminAuth(request, async (admin) => {
    try {
      const json = await request.json()
      const imageUrl = typeof json?.image_url === "string" ? json.image_url : undefined
      if (!imageUrl) return NextResponse.json({ message: "image_url required" }, { status: 400 })

      await deleteImageByUrl(imageUrl)

      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error("Delete upload failed", err)
      return NextResponse.json({ message: "Delete failed" }, { status: 500 })
    }
  })