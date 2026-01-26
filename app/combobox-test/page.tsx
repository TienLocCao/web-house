"use client"

import * as React from "react"
import { Combobox } from "@/components/ui/combobox"

/* =======================
   MOCK DATA
======================= */

type ComboboxItem = {
  value: string
  label: string
}

const ALL_ITEMS: ComboboxItem[] = Array.from(
  { length: 100 },
  (_, i) => ({
    value: `item-${i + 1}`,
    label: `Item ${i + 1}`,
  })
)

/* =======================
   PAGE
======================= */

export default function ComboboxTestPage() {
  const PAGE_SIZE = 20

  const [value, setValue] = React.useState<string>()
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<ComboboxItem[]>(
    ALL_ITEMS.slice(0, PAGE_SIZE)
  )
  const [loading, setLoading] = React.useState(false)

  /* =======================
     FILTER
  ======================= */

  const filteredItems = React.useMemo(() => {
    if (!search) return ALL_ITEMS
    return ALL_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const hasMore = items.length < filteredItems.length

  /* =======================
     HANDLERS
  ======================= */

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
    setItems(filteredItems.slice(0, PAGE_SIZE))
  }

  const loadMore = () => {
    if (loading || !hasMore) return

    setLoading(true)

    // giả lập API
    setTimeout(() => {
      setItems(filteredItems.slice(0, (page + 1) * PAGE_SIZE))
      setPage((p) => p + 1)
      setLoading(false)
    }, 600)
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="p-10 max-w-sm space-y-4">
      <h1 className="text-lg font-semibold">Combobox Test</h1>

      <Combobox
        value={value}
        items={items}
        onChange={setValue}
        onSearch={handleSearch}
        hasMore={hasMore}
        isLoading={loading}
        onLoadMore={loadMore}
        placeholder="Select item"
        searchPlaceholder="Search item..."
      />

      <div className="text-sm text-muted-foreground">
        Selected value: <b>{value || "none"}</b>
      </div>
    </div>
  )
}
