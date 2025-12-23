"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldError } from "@/components/ui/field"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/select"

type ProductFormState = {
  name: string
  slug: string
  category_name: string
  room_type: string
  price: string
  stock: string
  is_featured: boolean
  is_available: boolean
  image_url: string
  description: string
}

type ProductPayload = {
  name: string
  slug: string
  category_name: string
  room_type?: string
  price: number
  stock: number
  is_featured: boolean
  is_available: boolean
  image_url?: string
  description?: string
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  category_name: "",
  room_type: "",
  price: "0",
  stock: "0",
  is_featured: false,
  is_available: true,
  image_url: "",
  description: "",
}

export default function ProductCreateEditDialog({
  mode = "create",
  product = null,
  open,
  onOpenChange,
  onSaved,
}: {
  mode?: "create" | "edit"
  product?: any | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved?: () => void
}) {
  const { toast } = useToast()

  // ===== form =====
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // ===== image =====
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")

  // ===== ui =====
  const [saving, setSaving] = useState(false)

  // ===== init =====
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? "",
        slug: product.slug ?? "",
        category_name: product.category_name ?? "",
        room_type: product.room_type ?? "",
        price: product.price?.toString() ?? "0",
        stock: product.stock?.toString() ?? "0",
        is_featured: Boolean(product.is_featured),
        is_available: product.is_available ?? true,
        image_url: product.image_url ?? "",
        description: product.description ?? "",
      })
      setPreviewUrl(product.image_url ?? "")
    } else {
      setForm(EMPTY_FORM)
      setPreviewUrl("")
      setImageFile(null)
    }
    setFieldErrors({})
  }, [product, open])

  // ===== helpers =====
  function slugify(v: string) {
    return v
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  }

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      const n = { ...prev }
      delete n[key]
      return n
    })
  }

  function applyFieldErrors(errors: any[]) {
    const errs: Record<string, string[]> = {}
    errors.forEach((e) => {
      const key = e.path || "_form"
      errs[key] = errs[key] || []
      errs[key].push(e.message)
    })
    setFieldErrors(errs)
  }

  async function uploadImage(file: File): Promise<string> {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      applyFieldErrors([{ path: "image", message: "Invalid file type" }])
      throw new Error("Invalid file type")
    }

    const maxBytes = 5 * 1024 * 1024 // 5MB
    if (file.size > maxBytes) {
      applyFieldErrors([{ path: "image", message: "File too large (max 5MB)" }])
      throw new Error("File too large")
    }

    const fd = new FormData()
    fd.append("image", file)

    const res = await fetch("/api/admin/products/upload", {
      method: "POST",
      body: fd,
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      if (Array.isArray(json?.errors)) applyFieldErrors(json.errors)
      throw new Error(json?.message || "Upload image failed")
    }

    return json.image_url
  }

  function buildPayload(finalImageUrl: string): ProductPayload {
    return {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      category_name: form.category_name.trim(),
      room_type: form.room_type || undefined,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      is_featured: form.is_featured,
      is_available: form.is_available,
      image_url: finalImageUrl || undefined,
      description: form.description.trim() || undefined,
    }
  }

  async function submitProduct(payload: ProductPayload) {
    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${product.id}`

    const method = mode === "create" ? "POST" : "PATCH"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => null)
    return { res, json }
  }

  // ===== submit =====
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setSaving(true)
    setFieldErrors({})

    try {
      let finalImageUrl = form.image_url

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile)
        setForm((prev) => ({ ...prev, image_url: finalImageUrl }))
        setPreviewUrl(finalImageUrl)
      }

      const payload = buildPayload(finalImageUrl)
      const { res, json } = await submitProduct(payload)

      if (!res.ok) {
        if (Array.isArray(json?.errors)) {
          applyFieldErrors(json.errors)
          json.errors.forEach((e: any) =>
            toast({ title: e.message, type: "error" })
          )
        } else {
          toast({ title: json?.message || "Save failed", type: "error" })
        }
        return
      }

      toast({
        title: mode === "create" ? "Product created" : "Product updated",
        type: "success",
      })

      onOpenChange(false)
      onSaved?.()
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  // ===== render =====
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription>Nhập thông tin sản phẩm</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <FieldError errors={(fieldErrors.name || []).map((m) => ({ message: m }))} />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                value={form.category_name}
                onChange={(e) => updateField("category_name", e.target.value)}
              />
              <FieldError errors={(fieldErrors.category_name || []).map((m) => ({ message: m }))} />
            </div>

            <div>
              <Label>Room Type</Label>
              <Select
                value={form.room_type}
                onValueChange={(v) => updateField("room_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="living_room">Living Room</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={(fieldErrors.room_type || []).map((m) => ({ message: m }))} />
            </div>

            <div>
              <Label>Price</Label>
              <Input
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>

            <div>
              <Label>Stock</Label>
              <Input
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
              <FieldError errors={(fieldErrors.stock || []).map((m) => ({ message: m }))} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.is_featured}
                  onCheckedChange={(v) =>
                    updateField("is_featured", Boolean(v))
                  }
                />
                Featured
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.is_available}
                  onCheckedChange={(v) =>
                    updateField("is_available", Boolean(v))
                  }
                />
                Available
              </label>
            </div>

            <div>
              <Label>Image</Label>
              {previewUrl && (
                <img
                  src={previewUrl}
                  className="mb-2 h-24 rounded object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return

                  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
                  const maxBytes = 5 * 1024 * 1024
                  if (!allowed.includes(f.type)) {
                    applyFieldErrors([{ path: "image", message: "Invalid file type" }])
                    setImageFile(null)
                    setPreviewUrl("")
                    return
                  }
                  if (f.size > maxBytes) {
                    applyFieldErrors([{ path: "image", message: "File too large (max 5MB)" }])
                    setImageFile(null)
                    setPreviewUrl("")
                    return
                  }

                  // clear previous image errors
                  setFieldErrors((prev) => {
                    const n = { ...prev }
                    delete n.image
                    return n
                  })

                  setImageFile(f)
                  setPreviewUrl(URL.createObjectURL(f))
                }}
              />
              <FieldError errors={(fieldErrors.image || []).map((m) => ({ message: m }))} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
