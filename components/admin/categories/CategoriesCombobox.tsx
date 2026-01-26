// components/admin/categories/CategoriesCombobox.tsx
"use client"

import * as React from "react"
import { Combobox, ComboboxItem } from "@/components/ui/combobox"
import { Category } from "./useCategories"

type Props = {
  value: Category | null
  categories: Category[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onSearch?: (v: string) => void
  onChange: (category: Category | null) => void
}

export function CategoriesCombobox({
  value,
  categories,
  isLoading,
  hasMore,
  onLoadMore,
  onSearch,
  onChange,
}: Props) {
  const items: ComboboxItem[] = React.useMemo(
    () =>
      categories.map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [categories]
  )
  const selectedValue = value ? String(value.id) : undefined
  return (
    <Combobox
      value={selectedValue}
      items={items}
      placeholder="Select category"
      searchPlaceholder="Search category..."
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      onSearch={onSearch}
      onChange={(v) => {
        const id = Number(v)
        const category = categories.find((c) => c.id === id) || null
        onChange(category)
      }}
    />
  )
}
