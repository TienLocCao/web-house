export async function uploadImage(
  file: File,
  oldImageUrl?: string
): Promise<string> {
  const fd = new FormData()
  fd.append("image", file)
  if (oldImageUrl) fd.append("old_image_url", oldImageUrl)

  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    body: fd,
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json?.message || "Upload failed")

  return json.image_url
}
