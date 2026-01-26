"use client"

import { useEffect, useState } from "react"
import type { NewsletterSubscriber } from "@/lib/types/newsletter"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"
import { useNewsletterActions } from "@/hooks/admin"
import { useNewsletterData } from "@/hooks/admin/useNewsletterData"

interface NewsletterTableProps {
  initialData: NewsletterSubscriber[]
  initialTotal: number
  onDelete: (s: NewsletterSubscriber) => void
  onToggle: (s: NewsletterSubscriber) => void
  refreshKey?: number
}

export function NewsletterTable({ initialData, initialTotal, onDelete, onToggle, refreshKey }: NewsletterTableProps) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort, setSort] = useState<SortItem[]>([])
  
  const { data, total, isLoading: dataLoading } = useNewsletterData({ page, limit, sort, refreshKey })
  const { handleBulkDelete, isLoading: actionLoading } = useNewsletterActions()

  // Use API data if available, otherwise use initial data
  const displayData = data.length > 0 ? data : initialData
  const displayTotal = data.length > 0 ? total : initialTotal

  const columns: Column<NewsletterSubscriber>[] = [
    { key: "email", header: "Email", sortable: true },
    { key: "subscribed_at", header: "Subscribed", sortable: true },
    { key: "is_active", header: "Active", sortable: true, render: (r) => (r.is_active ? "Yes" : "No") },
  ]

  const deleteMany = async (ids: number[], mode: string) => {
    if (ids.length === 0 && mode !== "all") return
    const LEN = mode === "all" ? displayTotal : ids.length
    if (!confirm(`Delete ${LEN} subscribers?`)) return
    await handleBulkDelete(ids as any, mode)
    setPage(1)
  }

  return (
    <CoreTable 
      columns={columns} 
      data={displayData} 
      total={displayTotal} 
      page={page} 
      limit={limit} 
      sort={sort} 
      isLoading={dataLoading || actionLoading} 
      onPageChange={setPage} 
      onSortChange={setSort} 
      onDelete={onDelete} 
      onEdit={onToggle} 
      renderBulkActionBar={(s) => s.mode !== "none" ? (
        <div className="flex items-center gap-3">
          <div>{s.selectedCount} selected</div>
          <button className="btn" onClick={() => deleteMany(s.selectedIds, s.mode)}>Delete</button>
          <button className="btn" onClick={s.clear}>Clear</button>
        </div>
      ) : null} 
    />
  )
}