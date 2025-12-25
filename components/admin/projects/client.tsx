"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ProjectCreateEditDialog from "@/components/admin/projects/createEditDialog"
import { ProjectsTable } from "@/components/admin/projects/table"
import { ProjectDeleteDialog } from "@/components/admin/projects/deleteDialog"

export default function ProjectsClient({ initialData, initialTotal }: any) {
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  async function handleSave() {
    setCreateOpen(false)
    setEditOpen(false)
    setRefreshKey((s) => s + 1)
  }

  async function handleDeleteConfirm(id: string) {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE", credentials: "include" })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast({ title: json?.message || "Failed to delete project", type: "error" })
        return
      }
      toast({ title: "Project deleted", type: "success" })
      setDeleteOpen(false)
      setRefreshKey((s) => s + 1)
    } catch (err: any) {
      toast({ title: "Something went wrong", description: String(err), type: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Projects</h1>
          <p className="text-neutral-600 mt-1">Manage projects and portfolios</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Add Project</Button>
      </div>

      <ProjectsTable initialData={initialData} initialTotal={initialTotal} refreshKey={refreshKey} onEdit={(p: any) => { setSelected(p); setEditOpen(true) }} onDelete={(p: any) => { setSelected(p); setDeleteOpen(true) }} />

      <ProjectCreateEditDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} onSaved={handleSave} />
      <ProjectCreateEditDialog mode="edit" project={selected} open={editOpen} onOpenChange={setEditOpen} onSaved={handleSave} />
      <ProjectDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} onDeleteConfirm={() => selected && handleDeleteConfirm(selected.id)} />
    </div>
  )
}