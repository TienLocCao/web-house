"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CategoryCreateEditDialog from "@/components/admin/categories/createEditDialog"
import { CategoriesTable } from "@/components/admin/categories/table"
import { CategoryDeleteDialog } from "@/components/admin/categories/deleteDialog"

export default function CategoriesClient({ initialData, initialTotal }: any) {
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
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE", credentials: "include" })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast({ title: json?.message || "Failed to delete category", type: "error" })
        return
      }
      toast({ title: "Category deleted", type: "success" })
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
          <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>
          <p className="text-neutral-600 mt-1">Manage product categories</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <CategoriesTable initialData={initialData} initialTotal={initialTotal} refreshKey={refreshKey} onEdit={(c: any) => { setSelected(c); setEditOpen(true) }} onDelete={(c: any) => { setSelected(c); setDeleteOpen(true) }} />

      <CategoryCreateEditDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} onSaved={handleSave} />

      <CategoryCreateEditDialog mode="edit" category={selected} open={editOpen} onOpenChange={setEditOpen} onSaved={handleSave} />

      <CategoryDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} onDeleteConfirm={() => selected && handleDeleteConfirm(selected.id)} />

    </div>
  )
}