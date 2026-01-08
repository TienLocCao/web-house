import { useState } from "react"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/ui/field"
import { Upload } from "lucide-react"

type Props = {
  value?: string
  onChange: (file: File | null, preview: string) => void
  error?: string[]
}

export function ImageUploader({ value, onChange, error }: Props) {
  const [preview, setPreview] = useState(value || "")

  return (
    <div className="space-y-2">
      <Label className="pb-2">Image</Label>

      {/* Upload box */}
      <label
        className={`
          flex cursor-pointer flex-col items-center justify-center
          rounded-md border-2 border-dashed
          p-4 text-center transition
          hover:border-primary
          ${error?.length ? "border-destructive" : "border-muted"}
        `}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 rounded object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="text-sm">
              Click to upload image
            </span>
            <span className="text-xs">
              PNG, JPG, WEBP (max 5MB)
            </span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            e.target.value = ""

            const reader = new FileReader()
            reader.onload = () => {
              const url = reader.result as string
              setPreview(url)
              onChange(file, url)
            }
            reader.readAsDataURL(file)
          }}
        />
      </label>

      <FieldError
        errors={(error || []).map((m) => ({ message: m }))}
      />
    </div>
  )
}
