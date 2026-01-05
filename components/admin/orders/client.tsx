"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"
import { OrdersTable } from "@/components/admin/orders/table"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrdersClient({ initialData, initialTotal }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const status = searchParams.get("status") || undefined

  const [searchQuery, setSearchQuery] = useState(query)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    debouncedSearch
      ? params.set("query", debouncedSearch)
      : params.delete("query")

    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedSearch])

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    router.push(pathname)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Orders</h1>
        <p className="text-neutral-600 mt-1">Manage customer orders and fulfillment</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-[250px] pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <Select value={status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchQuery || (status && status !== "all")) && (
          <Button variant="outline" onClick={handleClearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <OrdersTable 
        initialData={initialData}
        initialTotal={initialTotal}
        search={debouncedSearch}
        status={status}
      />
    </div>
  )
}


