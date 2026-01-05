
"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import ProductCreateEditDialog from "@/components/admin/products/createEditDialog"
import { ProductsTable } from "@/components/admin/products/table"
import { ProductDeleteDialog } from "@/components/admin/products/deleteDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRoomTypes } from "@/hooks/useRoomTypes"
import { useDebounce } from "@/hooks/useDebounce"
import { X } from "lucide-react"

export default function ProductsClient({ initialData, initialTotal }: any) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
   const [refreshKey, setRefreshKey] = useState(0)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const roomType = searchParams.get("room_type") || undefined
  const sort = searchParams.get("sort") || "newest"
  const query = searchParams.get("query") || ""

  const [searchQuery, setSearchQuery] = useState(query)
  const debouncedSearch = useDebounce(searchQuery, 300)

  async function handleSave() {
    setCreateOpen(false)
    setEditOpen(false)
     // trigger table to refetch
     setRefreshKey((s) => s + 1)
  }

  const { toast } = useToast()

  const { values: roomTypes } = useRoomTypes()


  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    debouncedSearch
      ? params.set("query", debouncedSearch)
      : params.delete("query")

    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedSearch])

  const handRoomTypeChange  = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete("room_type")
    } else {
      params.set("room_type", value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    router.push(pathname)
  }

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

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Input
            placeholder="Search products..."
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

        <div>
          <Select value={roomType || "all"} onValueChange={handRoomTypeChange}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All room types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {roomTypes.map((rt: string) => (
                <SelectItem key={rt} value={rt}>
                  {rt.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(searchQuery || (roomType && roomType !== "all")) && (
          <Button variant="outline" onClick={handleClearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <ProductsTable
        initialData={initialData}
        initialTotal={initialTotal}
        refreshKey={refreshKey}
        search={debouncedSearch}
        roomType={roomType}
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