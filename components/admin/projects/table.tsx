"use client"

import { useEffect, useState } from "react"
import type { Project } from "@/lib/types/project"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"

interface ProjectsTableProps {
  initialData: Project[]
  initialTotal: number
  onEdit: (p: Project) => void
  onDelete: (p: Project) => void
  refreshKey?: number
  search?: string
  status?: string
}

export function ProjectsTable({ initialData, initialTotal, onEdit, onDelete, refreshKey, search, status }: ProjectsTableProps) {
  const [data, setData] = useState<Project[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [sort, setSort] = useState<SortItem[]>([])
  const [loading, setLoading] = useState(false)

  const columns: Column<Project>[] = [
    { key: "title", header: "Title", sortable: true },
    { key: "slug", header: "Slug", sortable: true },
    { key: "client_name", header: "Client", sortable: true },
    { key: "location", header: "Location", sortable: true },
    { key: "status", header: "Status", sortable: true },
    { key: "featured", header: "Featured", sortable: true },
    {
      key: "image_url",
      header: "Image",
      sortable: false,
      render: (row) => row.image_url ? <img src={row.image_url} className="h-10 w-10 rounded object-cover" /> : "-",
    },
  ]

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(limit))
        params.set("sort", JSON.stringify(sort))
        if (search) params.set("search", search)
        if (status) params.set("status", status)

        const res = await fetch(`/api/admin/projects?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch projects")
        const json: { items: Project[]; total: number } = await res.json()
        if (!ignore) {
          if (json.items.length === 0 && page > 1) { setPage((p) => Math.max(1, p - 1)); return }
          setData(json.items)
          setTotal(json.total)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchData()
    return () => { ignore = true }
  }, [page, sort, refreshKey, search, status])

  // when filters change, reset to first page
  useEffect(() => {
    setPage(1)
  }, [search, status])

  const deleteMany = async (ids: number[], mode: string) => {
    if (ids.length === 0 && mode !== "all") return
    const LEN = mode === "all" ? total : ids.length
    if (!confirm(`Delete ${LEN} projects?`)) return
    await fetch("/api/admin/projects/bulk-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, mode }) })
    setPage(1)
  }

  return (
    <CoreTable columns={columns} data={data} total={total} page={page} limit={limit} sort={sort} isLoading={loading} onPageChange={setPage} onSortChange={setSort} onEdit={onEdit} onDelete={onDelete} renderBulkActionBar={(s) => s.mode !== "none" ? (
      <div className="flex items-center gap-3">
        <div>{s.selectedCount} selected</div>
        <button className="btn" onClick={() => deleteMany(s.selectedIds, s.mode)}>Delete</button>
        <button className="btn" onClick={s.clear}>Clear</button>
      </div>
    ) : null} />
  )
}