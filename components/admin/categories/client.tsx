"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CategoryCreateEditDialog from "@/components/admin/categories/createEditDialog"
import { CategoriesTable } from "@/components/admin/categories/table"
import { CategoryDeleteDialog } from "@/components/admin/categories/deleteDialog"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import { X } from "lucide-react"

export default function CategoriesClient({ initialData, initialTotal }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""

  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [searchQuery, setSearchQuery] = useState(query)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    debouncedSearch
      ? params.set("query", debouncedSearch)
      : params.delete("query")

    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedSearch])

  async function handleSave() {
    setCreateOpen(false)
    setEditOpen(false)
    setRefreshKey((s) => s + 1)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    router.push(pathname)
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
    <div className="space-y-6 flex flex-col min-h-0">
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

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-[250px] pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery && (
          <Button variant="outline" onClick={handleClearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <CategoriesTable 
        initialData={initialData} 
        initialTotal={initialTotal} 
        refreshKey={refreshKey}
        search={debouncedSearch}
        onEdit={(c: any) => { setSelected(c); setEditOpen(true) }} 
        onDelete={(c: any) => { setSelected(c); setDeleteOpen(true) }} 
      />

      <CategoryCreateEditDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} onSaved={handleSave} />

      <CategoryCreateEditDialog mode="edit" category={selected} open={editOpen} onOpenChange={setEditOpen} onSaved={handleSave} />

      <CategoryDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} onDeleteConfirm={() => selected && handleDeleteConfirm(selected.id)} />

    </div>
  )
}