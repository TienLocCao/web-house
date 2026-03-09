"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useToast } from "@/hooks/useToast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { FieldError } from "@/components/ui/field"
import { ImageUploader } from "@/components/admin/products/ImageUploader"
import GalleryUploader from "@/components/admin/shared/GalleryUploader"
import { uploadImage, deleteImage } from "@/lib/services/imageUpload"
import { useRoomTypes } from "@/hooks/useRoomTypes"
import { useProjectForm, EMPTY_FORM } from "@/hooks/admin/projects/useProjectForm"
import type { Project, ProjectStatus, ProjectFormState } from "@/lib/types/project"
import type { GalleryItem } from "@/lib/types/media"
import type {
  ProjectCreate,
  ProjectUpdate,
} from "@/lib/schemas/project.schema"

type ProjectPayload = ProjectCreate | ProjectUpdate

type ProjectDialogMode = "create" | "edit"

type ProjectDialogProps = {
  mode?: ProjectDialogMode
  project?: Project | null
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
}: ProjectDialogProps) {
  const { toast } = useToast()
  const { values: roomTypes } = useRoomTypes()

  const { form, setForm, updateField } = useProjectForm(undefined, (key) => {
    setFieldErrors((prev) => {
      const n = { ...prev }
      delete n[key]
      return n
    })
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)

  const imageFileRef = useRef<File | null>(null)
  /** ảnh upload mới (để cleanup nếu cancel / lỗi) */
  const newlyUploadedRef = useRef<string[]>([])
  /** ảnh đã tồn tại ban đầu (cover + gallery cũ) */
  const initialImagesRef = useRef<string[]>([])

  // =========================
  // Init form
  // =========================
  useEffect(() => {
    if (project) {
      const gallery = Array.isArray(project.gallery)
        ? project.gallery
        : []

      const normalizedGallery: GalleryItem[] = gallery.map((item) =>
        typeof item === "string"
          ? { id: crypto.randomUUID(), url: item }
          : {
              id: item.id ?? crypto.randomUUID(),
              url: item.url,
              status: item.status,
            }
      )

      setForm({
        title: project.title ?? "",
        slug: project.slug ?? "",
        client_name: project.client_name ?? "",
        location: project.location ?? "",
        description: project.description ?? "",
        image_url: project.image_url ?? "",
        gallery: normalizedGallery,
        room_type: project.room_type ?? "",
        status: project.status ?? "completed",
        completion_date: project.completion_date ?? "",
        budget: project.budget?.toString() ?? "",
        featured: Boolean(project.featured),
      })

      const initialGalleryUrls = normalizedGallery.map((g) => g.url)

      initialImagesRef.current = [
        project.image_url,
        ...initialGalleryUrls,
      ].filter(Boolean)

      newlyUploadedRef.current = []
    } else {
      setForm(EMPTY_FORM)
      imageFileRef.current = null
      initialImagesRef.current = []
      newlyUploadedRef.current = []
    }
    setFieldErrors({})
  }, [project, open])

  function slugify(v: string) {
    return v
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  }

  function isValidBudget(value: string | undefined) {
    if (!value) return true
    return /^\d+(\.\d+)?$/.test(value)
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

  function buildPayload(finalImageUrl: string): ProjectPayload {
    return {
      title: form.title.trim(),
      slug: (form.slug || slugify(form.title)).trim(),
      client_name: form.client_name || undefined,
      location: form.location || undefined,
      description: form.description || undefined,
      image_url: finalImageUrl,
      gallery: form.gallery.map((g) => g.url),
      room_type: form.room_type || undefined,
      status: form.status,
      completion_date: form.completion_date || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      featured: form.featured,
    }
  }

  async function submitProject(payload: ProjectPayload) {
    const url =
      mode === "create" || !project
        ? "/api/admin/projects"
        : `/api/admin/projects/${project.id}`

    const method = mode === "create" ? "POST" : "PATCH"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => null)
    return { res, json }
  }
  // =========================
  // Submit
  // =========================
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!isValidBudget(form.budget)) {
      setFieldErrors((prev) => ({
        ...prev,
        budget: ["Budget must be a valid number"],
      }))
      return
    }

    setSaving(true)
    setFieldErrors({})
    try {
      let cover = form.image_url

      if (imageFileRef.current) {
        cover = await uploadImage(imageFileRef.current, form.image_url, "projects")
        newlyUploadedRef.current.push(cover)
      }

      const payload = buildPayload(cover)
      const { res, json } = await submitProject(payload)
      console.log(res, json)
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

      // Delete old cover image when successfully replaced with new one
      if (imageFileRef.current && initialImagesRef.current[0] && initialImagesRef.current[0] !== cover) {
        await deleteImage(initialImagesRef.current[0])
      }

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

    await Promise.allSettled(toDelete.map((u: string) => deleteImage(u)))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>
      <DialogContent className="max-w-xl flex flex-col p-0" side="right">
        <DialogHeader className="flex-shrink-0 p-6">
          <DialogTitle>
            {mode === "create" ? "Create Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 flex-shrink-1 overflow-y-auto">
          <div className="grid gap-4">
            <div>
              <Label className="pb-2">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
              <FieldError
                errors={(fieldErrors.title || []).map((m) => ({ message: m }))}
              />
            </div>

            <div>
              <Label className="pb-2">Client</Label>
              <Input
                value={form.client_name || ""}
                onChange={(e) => updateField("client_name", e.target.value)}
              />
              <FieldError
                errors={(fieldErrors.client_name || []).map((m) => ({
                  message: m,
                }))}
              />
            </div>

            <ImageUploader
              value={form.image_url}
              error={fieldErrors.image_url}
              onChange={(file, preview) => {
                imageFileRef.current = file
                updateField("image_url", preview)
              }}
            />

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
              <Label className="pb-2">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => updateField("status", v as ProjectStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
              <FieldError
                errors={(fieldErrors.status || []).map((m) => ({
                  message: m,
                }))}
              />
            </div>

            <div>
              <Label className="pb-2">Budget</Label>
              <Input
                value={form.budget ?? ""}
                inputMode="decimal"
                onChange={(e) => updateField("budget", e.target.value)}
              />
              <FieldError
                errors={(fieldErrors.budget || []).map((m) => ({
                  message: m,
                }))}
              />
            </div>
            {/* ✅ GALLERY */}
            <GalleryUploader
              value={form.gallery}
              onChange={(items) => setForm((p) => ({ ...p, gallery: items }))}
              max={10}
              folder="projects"
            />

            <div>
              <Label className="pb-2">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
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
          <Button type="submit" disabled={saving} className="w-[50%]" onClick={(e) => handleSubmit(e)}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
