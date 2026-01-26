"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/useToast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { ImageUploader } from "@/components/admin/products/ImageUploader"
import { uploadImage, deleteImage } from "@/lib/services/imageUpload"
import { slugify } from '@/lib/utils/slugify'

type FormState = { name: string; slug: string; description: string; image_url?: string }

const EMPTY: FormState = { name: "", slug: "", description: "" }

export default function CategoryCreateEditDialog({ mode = "create", category = null, open, onOpenChange, onSaved }: { mode?: "create" | "edit"; category?: any | null; open: boolean; onOpenChange: (v: boolean) => void; onSaved?: () => void }) {
  const { toast } = useToast()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const newlyUploadedRef = useRef<string[]>([])
  /** ảnh đã tồn tại ban đầu */
  const initialImageRef = useRef<string | null>(null)

  useEffect(() => {
    if (category) {
      setForm({ name: category.name ?? "", slug: category.slug ?? "", description: category.description ?? "" })
      setPreviewUrl(category.image_url ?? "")
      initialImageRef.current = category.image_url ?? null
      newlyUploadedRef.current = []
    } else {
      setForm(EMPTY)
      setPreviewUrl("")
      setImageFile(null)
    }
    setFieldErrors({})
  }, [category, open])

  function updateField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }))
    setFieldErrors((p) => { const n = { ...p }; delete n[k]; return n })
  }

  async function submit(payload: any) {
    const url = mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${category.id}`
    const method = mode === "create" ? "POST" : "PATCH"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    const json = await res.json().catch(() => null)
    return { res, json }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setSaving(true)
    setFieldErrors({})

    try {
      let finalUrl = form.image_url
      if (imageFile) {
        finalUrl = await uploadImage(imageFile, form.image_url, "categories")
        newlyUploadedRef.current.push(finalUrl)
        setForm((p) => ({ ...p, image_url: finalUrl }))
        setPreviewUrl(finalUrl)
      }

      const payload = { name: form.name.trim(), slug: slugify(form.name).trim(), description: form.description.trim() || undefined, image_url: finalUrl || undefined }

      const { res, json } = await submit(payload)

      if (!res.ok) {
        if (newlyUploadedRef.current.length) {
          await Promise.allSettled(newlyUploadedRef.current.map((u) => deleteImage(u)))
        }
        if (Array.isArray(json?.errors)) {
          const errs: Record<string, string[]> = {}
          json.errors.forEach((e: any) => { const key = e.path || "_form"; errs[key] = errs[key] || []; errs[key].push(e.message) })
          setFieldErrors(errs)
          json.errors.forEach((e: any) => toast({ title: e.message, type: "error" }))
        } else {
          toast({ title: json?.message || "Save failed", type: "error" })
        }
        return
      }

      // Delete old image when successfully replaced with new one
      if (imageFile && initialImageRef.current && initialImageRef.current !== finalUrl) {
        await deleteImage(initialImageRef.current)
      }

      toast({ title: mode === "create" ? "Category created" : "Category updated", type: "success" })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Category" : "Edit Category"}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="pb-2">Name</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
              <FieldError errors={(fieldErrors.name || []).map((m) => ({ message: m }))} />
            </div>

            <ImageUploader value={previewUrl} onChange={(file, preview) => { setImageFile(file); setPreviewUrl(preview); setFieldErrors((p) => { const n = { ...p }; delete n.image; return n }) }} error={fieldErrors.image_url} />

            <div>
              <Label className="pb-2">Description</Label>
              <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}