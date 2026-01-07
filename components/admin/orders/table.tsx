"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { CoreTable } from "@/components/core/CoreTable"
import type { Column, SortItem } from "@/lib/types/table"
import type { Order } from "@/lib/types/order"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface OrdersTableProps {
  initialData: Order[]
  initialTotal: number
  search?: string
  status?: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export function OrdersTable({ initialData, initialTotal, search, status }: OrdersTableProps) {
  const { toast } = useToast()
  const [data, setData] = useState<Order[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort, setSort] = useState<SortItem[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)

  const columns: Column<Order>[] = [
    {
      key: "order_number",
      header: "Order",
      sortable: true,
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="font-medium text-blue-600 hover:underline">
          {row.order_number}
        </Link>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.customer_name}</p>
          <p className="text-sm text-neutral-600">{row.customer_email}</p>
        </div>
      ),
    },
    { key: "item_count", header: "Items", sortable: true, render: (row) => `${row.item_count} items` },
    {
      key: "total_amount",
      header: "Total",
      sortable: true,
      render: (row) => `$${Number(row.total_amount).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <Select
          value={row.status}
          onValueChange={(value) => handleStatusChange(row.id, value)}
          disabled={updating === row.id}
        >
          <SelectTrigger
            className={`h-7 px-3 text-xs font-medium rounded-full border-0 cursor-pointer ${statusColors[row.status]}`}
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/orders/${row.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      ),
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

        const res = await fetch(`/api/admin/orders?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch orders")

        const json: { items: Order[]; total: number } = await res.json()

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
  }, [page, sort, search, status])

  // when filters change, reset to first page
  useEffect(() => {
    setPage(1)
  }, [search, status])

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdating(orderId)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({ title: "Status updated", type: "success" })
        // Refetch data
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(limit))
        params.set("sort", JSON.stringify(sort))
        if (search) params.set("search", search)
        if (status) params.set("status", status)

        const res = await fetch(`/api/admin/orders?${params.toString()}`)
        if (res.ok) {
          const json: { items: Order[]; total: number } = await res.json()
          setData(json.items)
        }
      } else {
        const json = await response.json().catch(() => null)
        toast({ title: json?.error || "Failed to update order status", type: "error" })
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast({ title: "An error occurred", type: "error" })
    } finally {
      setUpdating(null)
    }
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
      onEdit={() => {}}
      onDelete={() => {}}
    />
  )
}

