"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Column, SortItem } from "@/lib/types/table"
import { CoreTableSkeleton } from "./CoreTableSkeleton"

interface CoreTableProps<T extends { id: number }> {
  columns: Column<T>[]
  data: T[]
  total: number
  page: number
  limit: number
  sort: SortItem[]
  isLoading?: boolean

  onPageChange: (page: number) => void
  onSortChange: (sort: SortItem[]) => void
  onSelectChange?: (ids: number[]) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

export function CoreTable<T extends { id: number }>({
  columns,
  data,
  total,
  page,
  limit,
  sort,
  isLoading = false,
  onPageChange,
  onSortChange,
  onSelectChange,
  onEdit,
  onDelete,
}: CoreTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  /* ---------- SORT ---------- */
  const toggleSort = (key: string) => {
    if (isLoading) return

    const existing = sort.find((s) => s.key === key)
    let nextSort: SortItem[]

    if (!existing) {
      nextSort = [...sort, { key, order: "asc" }]
    } else if (existing.order === "asc") {
      nextSort = sort.map((s) =>
        s.key === key ? { ...s, order: "desc" } : s
      )
    } else {
      nextSort = sort.filter((s) => s.key !== key)
    }

    onSortChange(nextSort)
  }

  const getSortIndex = (key: string) =>
    sort.findIndex((s) => s.key === key)

  /* ---------- SELECT ---------- */
  const toggleSelectAll = (checked: boolean) => {
    const ids = checked ? data.map((d) => d.id) : []
    setSelectedIds(ids)
    onSelectChange?.(ids)
  }

  const toggleSelectRow = (id: number, checked: boolean) => {
    const ids = checked
      ? [...selectedIds, id]
      : selectedIds.filter((i) => i !== id)

    setSelectedIds(ids)
    onSelectChange?.(ids)
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="space-y-4 relative">
      {/* Overlay loading (UX tốt hơn) */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
          <span className="animate-spin text-lg">⏳</span>
        </div>
      )}
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    selectedIds.length === data.length && data.length > 0
                  }
                  onCheckedChange={(v) =>
                    toggleSelectAll(Boolean(v))
                  }
                  disabled={isLoading}
                />
              </TableHead>

              {columns.map((col) => {
                const sortIndex = getSortIndex(col.key)
                const sortItem = sort[sortIndex]

                return (
                  <TableHead
                    key={col.key}
                    onClick={() =>
                      col.sortable && toggleSort(col.key)
                    }
                    className={cn(
                      col.sortable && !isLoading && "cursor-pointer select-none"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {sortItem && (
                        <span className="text-xs text-muted-foreground">
                          {sortItem.order === "asc" ? "↑" : "↓"}
                          <sup>{sortIndex + 1}</sup>
                        </span>
                      )}
                    </div>
                  </TableHead>
                )
              })}

              {/* Actions column */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <CoreTableSkeleton rows={limit} cols={columns.length + 2} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="text-center py-8 text-muted-foreground"
                >
                  No data
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onCheckedChange={(v) =>
                        toggleSelectRow(row.id, Boolean(v))
                      }
                    />
                  </TableCell>

                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key])}
                    </TableCell>
                  ))}

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit && onEdit(row)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete && onDelete(row)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t pt-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  className="h-8 w-8 p-0"
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
</Card>
    </div>
  )
}
