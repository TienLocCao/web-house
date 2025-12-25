"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/select"
import { ImageUploader } from "@/components/admin/products/ImageUploader"
import { uploadImage } from "@/lib/services/image-upload"
import { useRoomTypes } from "@/hooks/use-room-types"

type FormState = {
  title: string
  slug: string
  client_name?: string
  location?: string
  description?: string
  image_url?: string
  gallery: string[]
  room_type?: string
  status?: string
  completion_date?: string
  budget?: string
  featured?: boolean
}

const EMPTY: FormState = { title: "", slug: "", client_name: "", location: "", description: "", image_url: "", gallery: [], room_type: "", status: "completed", completion_date: "", budget: "", featured: false }

export default function ProjectCreateEditDialog({ mode = "create", project = null, open, onOpenChange, onSaved }: { mode?: "create" | "edit"; project?: any | null; open: boolean; onOpenChange: (v: boolean) => void; onSaved?: () => void }) {
  const { toast } = useToast()
  const { values: roomTypes, isLoading: roomTypesLoading } = useRoomTypes()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (project) {
      setForm({ title: project.title ?? "", slug: project.slug ?? "", client_name: project.client_name ?? "", location: project.location ?? "", description: project.description ?? "", image_url: project.image_url ?? "", gallery: project.gallery ?? [], room_type: project.room_type ?? "", status: project.status ?? "completed", completion_date: project.completion_date ?? "", budget: project.budget?.toString() ?? "", featured: Boolean(project.featured) })
    } else {
      setForm(EMPTY)
      setGalleryFiles([])
      setImageFile(null)
    }
    setFieldErrors({})
  }, [project, open])

  function updateField<K extends keyof FormState>(k: K, v: FormState[K]) { setForm((p) => ({ ...p, [k]: v })); setFieldErrors((p) => { const n = { ...p }; delete n[k]; return n }) }

  function slugify(v: string) { return v.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") }

  async function handleGalleryFiles(files: File[]) {
    const urls: string[] = []
    for (const f of files) {
      const url = await uploadImage(f)
      urls.push(url)
    }
    setForm((p) => ({ ...p, gallery: [...(p.gallery || []), ...urls] }))
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setSaving(true)
    setFieldErrors({})

    try {
      let finalImage = form.image_url
      if (imageFile) { finalImage = await uploadImage(imageFile, form.image_url); setForm((p) => ({ ...p, image_url: finalImage })) }

      const payload = {
        title: form.title.trim(),
        slug: (form.slug || slugify(form.title)).trim(),
        client_name: form.client_name?.trim() || undefined,
        location: form.location?.trim() || undefined,
        description: form.description?.trim() || undefined,
        image_url: finalImage || undefined,
        gallery: form.gallery || [],
        room_type: form.room_type || undefined,
        status: form.status || undefined,
        completion_date: form.completion_date || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        featured: form.featured,
      }

      const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${project.id}`
      const method = mode === "create" ? "POST" : "PATCH"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
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

      toast({ title: mode === "create" ? "Project created" : "Project updated", type: "success" })
      onOpenChange(false)
      onSaved?.()
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Project" : "Edit Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div>
              <Label>Client</Label>
              <Input value={form.client_name || ""} onChange={(e) => updateField("client_name", e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location || ""} onChange={(e) => updateField("location", e.target.value)} />
            </div>
            <div>
              <Label>Room Type</Label>
              <Select value={form.room_type} onValueChange={(v) => updateField("room_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {roomTypesLoading && <SelectItem value="" disabled>Loading...</SelectItem>}
                  {!roomTypesLoading && roomTypes.length === 0 && <SelectItem value="" disabled>No room types</SelectItem>}
                  {roomTypes.map((v: string) => <SelectItem key={v} value={v}>{v.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <ImageUploader value={form.image_url} onChange={(file, preview) => { setImageFile(file); updateField("image_url", preview) }} error={fieldErrors.image_url} />

            <div>
              <Label>Gallery</Label>
              <div className="flex gap-2 flex-wrap">
                {(form.gallery || []).map((u, i) => (
                  <img key={i} src={u} className="h-20 w-20 rounded object-cover" />
                ))}
                <label className="flex items-center justify-center h-20 w-20 rounded border-2 border-dashed cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" multiple onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    await handleGalleryFiles(files)
                    e.currentTarget.value = ""
                  }} />
                  <div className="text-sm text-muted-foreground">Add</div>
                </label>
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Input value={form.status} onChange={(e) => updateField("status", e.target.value)} />
            </div>

            <div>
              <Label>Budget</Label>
              <Input value={form.budget} onChange={(e) => updateField("budget", e.target.value)} />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
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