"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import ProductCreateEditDialog from "@/components/admin/products/createEditDialog"
import { ProductsTable } from "@/components/admin/products/table"
import { ProductDeleteDialog } from "@/components/admin/products/deleteDialog"

export default function ProductsClient({ initialData, initialTotal }: any) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
   const [refreshKey, setRefreshKey] = useState(0)

  async function handleSave() {
    setCreateOpen(false)
    setEditOpen(false)
     // trigger table to refetch
     setRefreshKey((s) => s + 1)
  }

  const { toast } = useToast()

  async function handleDeleteConfirm(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast({ title: json?.message || "Failed to delete product", type: "error" })
        return
      }
      toast({ title: "Product deleted", type: "success" })
      setDeleteOpen(false)
      // trigger table to refetch and handle empty page
      setRefreshKey((s) => s + 1)
    } catch (err) {
      console.error(err)
      toast({ title: "Something went wrong", description: String(err), type: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-600 mt-1">Manage your product catalog</p>
        </div>

        {/* Add product opens dialog instead of linking */}
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <ProductsTable
        initialData={initialData}
        initialTotal={initialTotal}
        refreshKey={refreshKey}
        onEdit={(product: any) => { setSelected(product); setEditOpen(true) }}
        onDelete={(product: any) => { setSelected(product); setDeleteOpen(true) }}
      />

      {/* Create dialog */}
      <ProductCreateEditDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={handleSave}
      />

      {/* Edit dialog */}
      <ProductCreateEditDialog
        mode="edit"
        product={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={handleSave}
      />

      {/* Delete dialog */}
      <ProductDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleteConfirm={() => selected && handleDeleteConfirm(selected.id)}
      />

    </div>
  )
}