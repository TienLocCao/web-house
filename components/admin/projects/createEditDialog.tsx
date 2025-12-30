"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/useToast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ImageUploader } from "@/components/admin/products/ImageUploader"
import GalleryUploader from "@/components/admin/projects/GalleryUploader"
import { uploadImage, deleteImage } from "@/lib/services/imageUpload"
import { useRoomTypes } from "@/hooks/useRoomTypes"

type GalleryItem = {
  id: string
  url: string
}

type FormState = {
  title: string
  slug: string
  client_name?: string
  location?: string
  description?: string
  image_url?: string
  gallery: GalleryItem[]
  room_type?: string
  status?: string
  completion_date?: string
  budget?: string
  featured?: boolean
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  client_name: "",
  location: "",
  description: "",
  image_url: "",
  gallery: [],
  room_type: "",
  status: "completed",
  completion_date: "",
  budget: "",
  featured: false,
}

type Props = {
  mode?: "create" | "edit"
  project?: any | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved?: () => void
}

export default function ProjectCreateEditDialog({
  mode = "create",
  project,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const { toast } = useToast()
  const { values: roomTypes } = useRoomTypes()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  const imageFileRef = useRef<File | null>(null)

  /** ảnh đã tồn tại ban đầu */
  const initialImagesRef = useRef<string[]>([])
  /** ảnh upload mới (để cleanup nếu cancel / lỗi) */
  const newlyUploadedRef = useRef<string[]>([])

  // =========================
  // Init form
  // =========================
  useEffect(() => {
    if (project) {
      setForm({
        title: project.title ?? "",
        slug: project.slug ?? "",
        client_name: project.client_name ?? "",
        location: project.location ?? "",
        description: project.description ?? "",
        image_url: project.image_url ?? "",
        gallery: (project.gallery ?? []).map((url: string) => ({
          id: crypto.randomUUID(),
          url,
        })),
        room_type: project.room_type ?? "",
        status: project.status ?? "completed",
        completion_date: project.completion_date ?? "",
        budget: project.budget?.toString() ?? "",
        featured: Boolean(project.featured),
      })

      initialImagesRef.current = [
        project.image_url,
        ...(project.gallery ?? []),
      ].filter(Boolean)

      newlyUploadedRef.current = []
    } else {
      setForm(EMPTY)
      imageFileRef.current = null
      initialImagesRef.current = []
      newlyUploadedRef.current = []
    }
  }, [project, open])

  function updateField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function slugify(v: string) {
    return v
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  }

  // =========================
  // Submit
  // =========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let cover = form.image_url

      if (imageFileRef.current) {
        cover = await uploadImage(imageFileRef.current, form.image_url)
        newlyUploadedRef.current.push(cover)
      }

      const payload = {
        title: form.title.trim(),
        slug: (form.slug || slugify(form.title)).trim(),
        client_name: form.client_name || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
        image_url: cover || undefined,
        gallery: form.gallery.map((g) => g.url),
        room_type: form.room_type || undefined,
        status: form.status,
        completion_date: form.completion_date || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        featured: form.featured,
      }

      const res = await fetch(
        mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${project.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) throw new Error("Save failed")

      toast({ title: "Saved successfully", type: "success" })
      onOpenChange(false)
      onSaved?.()
    } catch (err: any) {
      await Promise.allSettled(
        newlyUploadedRef.current.map((u) => deleteImage(u))
      )
      toast({ title: err.message || "Error", type: "error" })
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

    await Promise.allSettled(toDelete.map((u: any) => deleteImage(u)))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div>
              <Label>Client</Label>
              <Input
                value={form.client_name || ""}
                onChange={(e) =>
                  updateField("client_name", e.target.value)
                }
              />
            </div>

            <ImageUploader
              value={form.image_url}
              onChange={(file, preview) => {
                imageFileRef.current = file
                updateField("image_url", preview)
              }}
            />

            <div>
              <Label>Room Type</Label>
              <Select
                value={form.room_type}
                onValueChange={(v) => updateField("room_type", v)}
                
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((v: string) => (
                    <SelectItem key={v} value={v}>
                      {v.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ✅ GALLERY */}
          <GalleryUploader
            value={form.gallery}
            onChange={(items) => setForm((p) => ({ ...p, gallery: items }))}
            max={10}
          />

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
            <Button type="button" variant="outline" onClick={handleCancel}>
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
