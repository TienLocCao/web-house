"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"

/* =======================
   Types
======================= */

export type ComboboxItem = {
  value: string
  label: string
}

type ComboboxProps = {
  value?: string
  items: ComboboxItem[]

  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean

  onChange: (value: string) => void
  onSearch?: (value: string) => void

  hasMore?: boolean
  isLoading?: boolean
  onLoadMore?: () => void

  debounceMs?: number
}

/* =======================
   Component
======================= */

export function Combobox({
  value,
  items,
  placeholder = "Select item",
  searchPlaceholder = "Search...",
  disabled,

  onChange,
  onSearch,

  hasMore,
  isLoading,
  onLoadMore,

  debounceMs = 300,
}: ComboboxProps) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, debounceMs)

  /* ===== FIND SELECTED ITEM (PINNED) ===== */
  const selectedItem = React.useMemo(
    () => items.find((i) => i.value === value),
    [items, value]
  )

  /* ===== API SEARCH (debounced) ===== */
  React.useEffect(() => {
    if (!onSearch) return
    if (!debouncedSearch.trim()) return
    onSearch(debouncedSearch)
  }, [debouncedSearch])

  /* ===== Local filter ===== */
  const filteredItems = React.useMemo(() => {
    if (!debouncedSearch) return items
    return items.filter((i) =>
      i.label.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [items, debouncedSearch])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {selectedItem ? selectedItem.label : placeholder}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {/* SEARCH */}
        <div className="p-2">
          <Input
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>

        {/* LIST */}
        <div
          className="max-h-60 overflow-auto"
          onScroll={(e) => {
            const el = e.currentTarget
            const reachedBottom =
              el.scrollTop + el.clientHeight >= el.scrollHeight - 24

            if (reachedBottom && hasMore && !isLoading) {
              onLoadMore?.()
            }
          }}
        >
          {filteredItems.length === 0 && !isLoading && (
            <div className="py-2 text-center text-sm text-muted-foreground">
              No result found
            </div>
          )}
          {filteredItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}

          {isLoading && (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}

          {!hasMore && filteredItems.length > 0 && !isLoading && (
            <div className="py-2 text-center text-xs text-muted-foreground">
              End of list
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  )
}
