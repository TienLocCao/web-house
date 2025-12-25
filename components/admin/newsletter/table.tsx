"use client"

import { useEffect, useState } from "react"
import type { NewsletterSubscriber } from "@/lib/types/newsletter"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"

interface NewsletterTableProps {
  initialData: NewsletterSubscriber[]
  initialTotal: number
  onDelete: (s: NewsletterSubscriber) => void
  onToggle: (s: NewsletterSubscriber) => void
  refreshKey?: number
}

export function NewsletterTable({ initialData, initialTotal, onDelete, onToggle, refreshKey }: NewsletterTableProps) {
  const [data, setData] = useState<NewsletterSubscriber[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort, setSort] = useState<SortItem[]>([])
  const [loading, setLoading] = useState(false)

  const columns: Column<NewsletterSubscriber>[] = [
    { key: "email", header: "Email", sortable: true },
    { key: "subscribed_at", header: "Subscribed", sortable: true },
    { key: "is_active", header: "Active", sortable: true, render: (r) => (r.is_active ? "Yes" : "No") },
  ]

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/newsletter?page=${page}&limit=${limit}&sort=${encodeURIComponent(JSON.stringify(sort))}`)
        if (!res.ok) throw new Error("Failed to fetch subscribers")
        const json: { items: NewsletterSubscriber[]; total: number } = await res.json()
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
  }, [page, sort, refreshKey])

  const deleteMany = async (ids: number[], mode: string) => {
    if (ids.length === 0 && mode !== "all") return
    const LEN = mode === "all" ? total : ids.length
    if (!confirm(`Delete ${LEN} subscribers?`)) return
    await fetch("/api/admin/newsletter/bulk-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, mode }) })
    setPage(1)
  }

  return (
    <CoreTable columns={columns} data={data} total={total} page={page} limit={limit} sort={sort} isLoading={loading} onPageChange={setPage} onSortChange={setSort} onDelete={onDelete} onEdit={onToggle} renderBulkActionBar={(s) => s.mode !== "none" ? (
      <div className="flex items-center gap-3">
        <div>{s.selectedCount} selected</div>
        <button className="btn" onClick={() => deleteMany(s.selectedIds, s.mode)}>Delete</button>
        <button className="btn" onClick={s.clear}>Clear</button>
      </div>
    ) : null} />
  )
}