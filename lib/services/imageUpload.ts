import { secureFetchJSON } from "@/lib/utils"

type UploadImageResponse = {
  image_url: string
}

export async function uploadImage(
  file: File,
  oldImageUrl?: string,
  folder?: string
): Promise<string> {
  const fd = new FormData()
  fd.append("image", file)
  if (oldImageUrl) fd.append("old_image_url", oldImageUrl)
  if (folder) fd.append("folder", folder)

  const json = await secureFetchJSON<UploadImageResponse>("/api/admin/uploads", {
    method: "POST",
    body: fd,
  })

  return json.image_url
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return

  await secureFetchJSON("/api/admin/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl }),
  })
}
