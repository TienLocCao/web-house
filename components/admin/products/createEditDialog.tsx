"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/useToast"
import { useRoomTypes } from "@/hooks/useRoomTypes"
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
} from "@/components/ui/select"
import { ImageUploader } from "@/components/admin/products/ImageUploader"
import { uploadImage, deleteImage } from "@/lib/services/imageUpload"

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
  const { values: roomTypes, isLoading: roomTypesLoading } = useRoomTypes()

  // ===== form =====
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // ===== image =====
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")

  // ===== ui =====
  const [saving, setSaving] = useState(false)
  const newlyUploadedRef = useRef<string[]>([])
  const initialImageRef = useRef<string | null>(null)

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
      initialImageRef.current = product.image_url ?? null
      newlyUploadedRef.current = []
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
        finalImageUrl = await uploadImage(imageFile, form.image_url)
        newlyUploadedRef.current.push(finalImageUrl)
        setForm((prev) => ({ ...prev, image_url: finalImageUrl }))
        setPreviewUrl(finalImageUrl)
      }

      const payload = buildPayload(finalImageUrl)
      const { res, json } = await submitProduct(payload)

      if (!res.ok) {
        if (newlyUploadedRef.current.length) {
          await Promise.allSettled(newlyUploadedRef.current.map((u) => deleteImage(u)))
        }
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
      if (newlyUploadedRef.current.length) {
        await Promise.allSettled(newlyUploadedRef.current.map((u) => deleteImage(u)))
      }
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

      <DialogContent className="max-w-xl" side="right">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription>Nhập thông tin sản phẩm</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label className="pb-2">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <FieldError errors={(fieldErrors.name || []).map((m) => ({ message: m }))} />
            </div>

            <div>
              <Label className="pb-2">Category</Label>
              <Input
                value={form.category_name}
                onChange={(e) => updateField("category_name", e.target.value)}
              />
              <FieldError errors={(fieldErrors.category_name || []).map((m) => ({ message: m }))} />
            </div>

            <div>
              <Label className="pb-2">Room Type</Label>
              <Select
                value={form.room_type}
                onValueChange={(v) => updateField("room_type", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypesLoading && (
                    <SelectItem value="" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  {!roomTypesLoading && roomTypes.length === 0 && (
                    <SelectItem value="" disabled>
                      No room types
                    </SelectItem>
                  )}
                  {roomTypes.map((v: string) => (
                    <SelectItem key={v} value={v}>
                      {v.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={(fieldErrors.room_type || []).map((m) => ({ message: m }))} />
            </div>

            <div>
              <Label className="pb-2">Price</Label>
              <Input
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>

            <div>
              <Label className="pb-2">Stock</Label>
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

            <ImageUploader
              value={form.image_url}
              error={fieldErrors.image_url}
              onChange={(file, preview) => {
                setImageFile(file)
                setPreviewUrl(preview)
                setFieldErrors((prev) => {
                  const n = { ...prev }
                  delete n.image
                  return n
                })
              }}
            />


          </div>

          <div>
            <Label className="pb-2">Description</Label>
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
