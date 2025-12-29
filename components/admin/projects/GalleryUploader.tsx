"use client"

import { useRef, useState } from "react"
import { uploadImage, deleteImage } from "@/lib/services/image-upload"
import { Button } from "@/components/ui/button"

export type GalleryItem = {
  id: string
  url: string
}

type Props = {
  value: GalleryItem[]
  onChange: (items: GalleryItem[]) => void
  max?: number
}

export default function GalleryUploader({
  value,
  onChange,
  max = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(files: FileList | null) {
    if (!files || uploading) return

    const remain = max - value.length
    if (remain <= 0) return

    setUploading(true)

    const fileArray = Array.from(files).slice(0, remain)
    const uploaded: GalleryItem[] = []

    try {
      for (const file of fileArray) {
        const url = await uploadImage(file)
        uploaded.push({
          id: crypto.randomUUID(),
          url,
        })
      }

      onChange([...value, ...uploaded])
    } catch (err) {
      console.error("Upload gallery error:", err)
      alert("Upload ảnh thất bại")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handleRemove(item: GalleryItem) {
    // xóa UI trước cho mượt
    onChange(value.filter((i) => i.id !== item.id))

    try {
      await deleteImage(item.url)
    } catch (err) {
      console.error("Delete image error:", err)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {value.map((item) => (
          <div
            key={item.id}
            className="relative h-24 w-24 rounded border overflow-hidden group"
          >
            <img
              src={item.url}
              alt=""
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1 opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}

        {value.length < max && (
          <label className="h-24 w-24 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-sm text-muted-foreground">
            {uploading ? "Uploading..." : "Add"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {value.length}/{max} images
      </div>
    </div>
  )
}
