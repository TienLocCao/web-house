"use client"

import { useEffect, useState } from "react"
import type { Category } from "@/lib/types/category"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"
import { secureFetchJSON } from "@/lib/utils"

interface CategoriesTableProps {
  initialData: Category[]
  initialTotal: number
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
  refreshKey?: number
  search?: string
}

export function CategoriesTable({ initialData, initialTotal, onEdit, onDelete, refreshKey, search }: CategoriesTableProps) {
  const [data, setData] = useState<Category[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort, setSort] = useState<SortItem[]>([])
  const [loading, setLoading] = useState(false)

  const columns: Column<Category>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "slug", header: "Slug", sortable: true },
    { key: "description", header: "Description", sortable: false },
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

        const json: { items: Category[]; total: number } = await secureFetchJSON(`/api/admin/categories?${params.toString()}`)
        if (!ignore) {
          if (json.items.length === 0 && page > 1) {
            setPage((p) => Math.max(1, p - 1))
            return
          }
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
  }, [page, sort, refreshKey, search])

  // when filters change, reset to first page
  useEffect(() => {
    setPage(1)
  }, [search])

  const deleteMany = async (ids: number[], mode: string) => {
    if (ids.length === 0 && mode !== "all") return
    const LEN = mode === "all" ? total : ids.length
    if (!confirm(`Delete ${LEN} categories?`)) return
    await secureFetchJSON("/api/admin/categories/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, mode }),
    })
    setPage(1)
  }

  return (
    <CoreTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      limit={limit}
      sort={sort}
      isLoading={loading}
      onPageChange={setPage}
      onSortChange={setSort}
      onEdit={onEdit}
      onDelete={onDelete}
      renderBulkActionBar={(s) =>
        s.mode !== "none" ? (
          <div className="flex items-center gap-3">
            <div>{s.selectedCount} selected</div>
            <button className="btn" onClick={() => deleteMany(s.selectedIds, s.mode)}>Delete</button>
            <button className="btn" onClick={s.clear}>Clear</button>
          </div>
        ) : null
      }
    />
  )
}