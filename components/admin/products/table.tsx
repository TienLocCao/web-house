"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/lib/types/product"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"

interface ProductsTableProps {
  initialData: Product[]
  initialTotal: number
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  refreshKey?: number
}

export function ProductsTable({ initialData,initialTotal, onEdit, onDelete, refreshKey }: ProductsTableProps) {
  const [data, setData] = useState<Product[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [sort, setSort] = useState<SortItem[]>([])
  const [loading, setLoading] = useState(true)

  const columns: Column<Product>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "slug", header: "Slug", sortable: true },
    { key: "category_name", header: "Category", sortable: true },
    { key: "price", header: "Price", sortable: true },
    { key: "stock", header: "Stock", sortable: true },
    { key: "is_featured", header: "Is Featured", sortable: true },
    { key: "is_available", header: "Status", sortable: true },
    { key: "image_url", header: "Image", sortable: false },
  ]

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/admin/products?page=${page}&sort=${encodeURIComponent(
            JSON.stringify(sort)
          )}`
        )
        if (!res.ok) throw new Error("Failed to fetch products")
        const json: { items: Product[]; total: number } = await res.json()
        if (!ignore) {
          // If current page becomes empty after an operation (e.g. delete last item),
          // step back one page and refetch.
          if (Array.isArray(json.items) && json.items.length === 0 && page > 1) {
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
    />
  )
}
