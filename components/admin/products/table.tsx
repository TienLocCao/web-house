"use client"

import { useState } from "react"
import type { Product } from "@/lib/types/product"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"
import { BulkDeleteBar } from "@/components/admin/products/BulkDeleteBar"
import { useProductActions } from "@/hooks/admin"
import { useProductsData } from "@/hooks/admin/useProductsData"

interface ProductsTableProps {
  initialData: Product[]
  initialTotal: number
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  refreshKey?: number
  search?: string
  roomType?: string
}

export function ProductsTable({
  initialData,
  initialTotal,
  onEdit,
  onDelete,
  refreshKey,
  search,
  roomType,
}: ProductsTableProps) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort, setSort] = useState<SortItem[]>([])

  const { data, total, isLoading: dataLoading } = useProductsData({
    page,
    limit,
    sort,
    search,
    roomType,
    refreshKey,
  })
  const { handleBulkDelete, isLoading: actionLoading } = useProductActions()

  // Use API data if available, otherwise use initial data
  const displayData = data.length > 0 ? data : initialData
  const displayTotal = data.length > 0 ? total : initialTotal

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

  /* ---------------- bulk delete ---------------- */
  const deleteMany = async (ids: number[], mode: string) => {
    if (ids.length === 0 && mode !== "all") return
    const LEN = mode === "all" ? displayTotal : ids.length
    

    if (!confirm(`Delete ${LEN} products?`)) return

    await handleBulkDelete(ids)
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
      isLoading={dataLoading}
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
            onDelete={() => deleteMany(s.selectedIds, s.mode)}
          />
        ) : null
      }
    />
  )
}
