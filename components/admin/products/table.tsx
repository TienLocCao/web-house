"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/lib/types/product"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"

interface ProductsTableProps {
  initialData: Product[]
  initialTotal: number
}

export function ProductsTable({ initialData,initialTotal }: ProductsTableProps) {
  const [data, setData] = useState<Product[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [sort, setSort] = useState<SortItem[]>([])
  const [loading, setLoading] = useState(false)
  console.log("start", loading);

  const columns: Column<Product>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "price", header: "Price", sortable: true },
    { key: "stock", header: "Stock", sortable: true },
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
  }, [page, sort])
  console.log("end", loading);

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
    />
  )
}
