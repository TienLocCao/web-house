"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/lib/types/product"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"
import { BulkDeleteBar } from "@/components/admin/products/BulkDeleteBar"

interface ProductsTableProps {
  initialData: Product[]
  initialTotal: number
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  refreshKey?: number
}

export function ProductsTable({
  initialData,
  initialTotal,
  onEdit,
  onDelete,
  refreshKey,
}: ProductsTableProps) {
  const [data, setData] = useState<Product[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [sort, setSort] = useState<SortItem[]>([])
  const [loading, setLoading] = useState(false)

  /* ---------------- columns ---------------- */
  const columns: Column<Product>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "slug", header: "Slug", sortable: true },
    { key: "category_name", header: "Category", sortable: true },
    { key: "price", header: "Price", sortable: true },
    { key: "stock", header: "Stock", sortable: true },
    { key: "is_featured", header: "Featured", sortable: true },
    { key: "is_available", header: "Available", sortable: true },
    {
      key: "image_url",
      header: "Image",
      sortable: false,
      render: (row) =>
        row.image_url ? (
          <img
            src={row.image_url}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          "-"
        ),
    },
  ]

  /* ---------------- fetch data ---------------- */
  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/admin/products?page=${page}&limit=${limit}&sort=${encodeURIComponent(
            JSON.stringify(sort)
          )}`
        )

        if (!res.ok) throw new Error("Failed to fetch products")

        const json: { items: Product[]; total: number } = await res.json()

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
    return () => {
      ignore = true
    }
  }, [page, sort, refreshKey])

  /* ---------------- bulk delete ---------------- */
  const deleteMany = async (ids: number[]) => {
    if (ids.length === 0) return

    if (!confirm(`Delete ${ids.length} products?`)) return

    await fetch("/api/admin/products/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })

    // reload current page
    setPage(1)
  }

  /* ---------------- render ---------------- */
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
          <BulkDeleteBar
            count={s.selectedCount}
            mode={s.mode} // chỉ page | all
            onClear={s.clear}
            onDelete={() => deleteMany(s.selectedIds)}
          />
        ) : null
      }
    />
  )
}
