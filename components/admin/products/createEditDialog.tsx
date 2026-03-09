"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useToast } from "@/hooks/useToast"
import { useRoomTypes } from "@/hooks/useRoomTypes"
import { slugify } from "@/lib/utils/slugify"
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
import { CategoriesCombobox } from "@/components/admin/categories/CategoriesCombobox"
import { useCategories, Category } from "@/components/admin/categories/useCategories"
import { useProductForm, EMPTY_FORM } from "@/hooks/admin/products/useProductForm"
import type { Product, ProductFormState } from "@/lib/types/product"
import type { GalleryItem } from "@/lib/types/media"
import GalleryUploader from "@/components/admin/shared/GalleryUploader"

type ProductPayload = {
  name: string
  slug: string
  category_id: number
  room_type?: string
  price: number
  stock: number
  is_featured: boolean
  is_available: boolean
  image_url?: string
  gallery: string[]
  description?: string
}

type ProductDialogMode = "create" | "edit"

type ProductDialogProps = {
  mode?: ProductDialogMode
  product?: Product | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved?: () => void
}

export default function ProductCreateEditDialog({
  mode = "create",
  product = null,
  open,
  onOpenChange,
  onSaved,
}: ProductDialogProps) {
  const { toast } = useToast()
  const { values: roomTypes, isLoading: roomTypesLoading } = useRoomTypes()

  // ===== form =====
  const { form, setForm, updateField } = useProductForm(undefined, (key) => {
    setFieldErrors((prev) => {
      const n = { ...prev }
      delete n[key]
      return n
    })
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // ===== ui =====
  const [saving, setSaving] = useState(false)

  const imageFileRef = useRef<File | null>(null)
  /** ảnh đã tồn tại ban đầu (cover + gallery cũ) */
  const initialImagesRef = useRef<string[]>([])
  /** ảnh upload mới (để cleanup nếu cancel / lỗi) */
  const newlyUploadedRef = useRef<string[]>([])
  const {
    values: categories,
    isLoading,
    hasMore,
    loadMore,
    searchCategories,
    ensureCategory,
  } = useCategories()

  // ===== init =====
  useEffect(() => {
    if (product) {
      const categoryId = String(product.category_id ?? "")
      setForm({
        name: product.name ?? "",
        slug: product.slug ?? "",
        category: null,
        category_id: categoryId,
        room_type: product.room_type ?? "",
        price: product.price?.toString() ?? "0",
        stock: product.stock?.toString() ?? "0",
        is_featured: Boolean(product.is_featured),
        is_available: product.is_available ?? true,
        image_url: product.image_url ?? "",
        gallery: (product.gallery ?? []).map((url: string) => ({
          id: crypto.randomUUID(),
          url,
        })),
        description: product.description ?? "",
      })

      initialImagesRef.current = [
        product.image_url,
        ...(product.gallery ?? []),
      ].filter(Boolean)
      newlyUploadedRef.current = []
    } else {
      setForm(EMPTY_FORM)
      imageFileRef.current = null
      initialImagesRef.current = []
      newlyUploadedRef.current = []
    }
    setFieldErrors({})
  }, [product, open, ensureCategory])

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
      category_id: Number(form.category_id),
      room_type: form.room_type || undefined,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      is_featured: form.is_featured,
      is_available: form.is_available,
      image_url: finalImageUrl || undefined,
      gallery: form.gallery.map((g) => g.url),
      description: form.description.trim() || undefined,
    }
  }

  async function submitProduct(payload: ProductPayload) {
    const url =
      mode === "create" || !product
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
  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    setSaving(true)
    setFieldErrors({})

    try {
      let cover = form.image_url
      if (imageFileRef.current) {
        cover = await uploadImage(
          imageFileRef.current,
          form.image_url,
          "products"
        )
        newlyUploadedRef.current.push(cover)
      }

      const payload = buildPayload(cover)
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

      // Delete old image when successfully replaced with new one
      if (
        imageFileRef.current &&
        initialImagesRef.current[0] &&
        initialImagesRef.current[0] !== cover
      ) {
        await deleteImage(initialImagesRef.current[0])
      }

      toast({
        title: mode === "create" ? "Product created" : "Product updated",
        type: "success",
      })

      onOpenChange(false)
      onSaved?.()
    } catch (err: any) {
      if (newlyUploadedRef.current.length) {
        await Promise.allSettled(
          newlyUploadedRef.current.map((u) => deleteImage(u))
        )
      }
      toast({ title: err.message || "Something went wrong", type: "error" })
    } finally {
      setSaving(false)
    }
  }
  // =========================
  // Cancel → cleanup
  // =========================
  async function handleCancel() {
    const currentUrls = [
      form.image_url,
      ...form.gallery.map((g) => g.url),
    ].filter((u): u is string => Boolean(u))

    const toDelete = currentUrls.filter(
      (u) => !initialImagesRef.current.includes(u)
    )

    await Promise.allSettled(toDelete.map((u: string) => deleteImage(u)))
    onOpenChange(false)
  }
  // ===== render =====
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>
      <DialogContent className="max-w-xl flex flex-col p-0" side="right">
        <DialogHeader className="flex-shrink-0 p-6">
          <DialogTitle>
            {mode === "create" ? "Create Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription>Nhập thông tin sản phẩm</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 flex-shrink-1 overflow-y-auto">
          <div className="grid gap-4">
            <div>
              <Label className="pb-2">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <FieldError
                errors={(fieldErrors.name || []).map((m) => ({
                  message: m,
                }))}
              />
            </div>

            <div>
              <Label className="pb-2">Category</Label>
              <CategoriesCombobox
                value={form.category}
                categories={categories}
                isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={loadMore}
                onSearch={searchCategories}
                onChange={(category) =>
                  setForm((p) => ({
                    ...p,
                    category,
                    category_id: category ? String(category.id) : "",
                  }))
                }
              />
              <FieldError
                errors={(fieldErrors.category_id || []).map((m) => ({
                  message: m,
                }))}
              />
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
                      {v
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                errors={(fieldErrors.room_type || []).map((m) => ({
                  message: m,
                }))}
              />
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
              <FieldError
                errors={(fieldErrors.stock || []).map((m) => ({
                  message: m,
                }))}
              />
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
                imageFileRef.current = file
                updateField("image_url", preview)
              }}
            />

            {/* ✅ GALLERY */}
            <GalleryUploader
              value={form.gallery}
              onChange={(items) => setForm((p) => ({ ...p, gallery: items }))}
              max={10}
              folder="products"
            />
          </div>

          <div>
            <Label className="pb-2">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </form>
        <DialogFooter className="flex-shrink-0 px-6 py-4 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-[50%]"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="w-[50%]" onClick={() => handleSubmit()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  )
}
