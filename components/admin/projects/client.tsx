"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ProjectCreateEditDialog from "@/components/admin/projects/createEditDialog"
import { ProjectsTable } from "@/components/admin/projects/table"
import { ProjectDeleteDialog } from "@/components/admin/projects/deleteDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"
import { X } from "lucide-react"
import { secureFetchJSON } from "@/lib/utils"

export default function ProjectsClient({ initialData, initialTotal }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const status = searchParams.get("status") || undefined

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

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    router.push(pathname)
  }

  async function handleSave() {
    setCreateOpen(false)
    setEditOpen(false)
    setRefreshKey((s) => s + 1)
  }

  async function handleDeleteConfirm(id: string) {
    try {
      const json = await secureFetchJSON(`/api/admin/projects/${id}`, { method: "DELETE", credentials: "include" })
      toast({ title: "Project deleted", type: "success" })
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
          <h1 className="text-3xl font-bold text-neutral-900">Projects</h1>
          <p className="text-neutral-600 mt-1">Manage projects and portfolios</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Add Project</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Input
            placeholder="Search projects..."
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
          <Select value={status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchQuery || (status && status !== "all")) && (
          <Button variant="outline" onClick={handleClearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <ProjectsTable 
        initialData={initialData} 
        initialTotal={initialTotal} 
        refreshKey={refreshKey}
        search={debouncedSearch}
        status={status}
        onEdit={(p: any) => { setSelected(p); setEditOpen(true) }} 
        onDelete={(p: any) => { setSelected(p); setDeleteOpen(true) }} 
      />

      <ProjectCreateEditDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} onSaved={handleSave} />
      <ProjectCreateEditDialog mode="edit" project={selected} open={editOpen} onOpenChange={setEditOpen} onSaved={handleSave} />
      <ProjectDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} onDeleteConfirm={() => selected && handleDeleteConfirm(selected.id)} />
    </div>
  )
}