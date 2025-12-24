import fs from "fs/promises"
import path from "path"

export async function deleteImageByUrl(imageUrl?: string | null) {
  if (!imageUrl) return

  if (!imageUrl.startsWith("/uploads/")) return

  const filePath = path.join(process.cwd(), "public", imageUrl)

  try {
    await fs.unlink(filePath)
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.error("Delete image failed:", filePath, err)
    }
  }
}
