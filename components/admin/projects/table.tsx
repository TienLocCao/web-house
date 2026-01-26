"use client"

import { useState } from "react"
import type { Project } from "@/lib/types/project"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"
import { useProjectActions } from "@/hooks/admin"
import { useProjectsData } from "@/hooks/admin/useProjectsData"

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
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort, setSort] = useState<SortItem[]>([])

  const { data, total, isLoading: dataLoading } = useProjectsData({
    page,
    limit,
    sort,
    search,
    status,
    refreshKey,
  })
  const { handleBulkDelete, isLoading: actionLoading } = useProjectActions()

  // Use API data if available, otherwise use initial data
  const displayData = data.length > 0 ? data : initialData
  const displayTotal = data.length > 0 ? total : initialTotal

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

  const deleteMany = async (ids: number[], mode: string) => {
    if (ids.length === 0 && mode !== "all") return
    const LEN = mode === "all" ? displayTotal : ids.length
    if (!confirm(`Delete ${LEN} projects?`)) return
    await handleBulkDelete(ids)
    setPage(1)
  }
  return (
    <CoreTable columns={columns} data={displayData} total={displayTotal} page={page} limit={limit} sort={sort} isLoading={dataLoading || actionLoading} onPageChange={setPage} onSortChange={setSort} onEdit={onEdit} onDelete={onDelete} renderBulkActionBar={(s) => s.mode !== "none" ? (
      <div className="flex items-center gap-3">
        <div>{s.selectedCount} selected</div>
        <button className="btn" onClick={() => deleteMany(s.selectedIds, s.mode)}>Delete</button>
        <button className="btn" onClick={s.clear}>Clear</button>
      </div>
    ) : null} />
  )
}