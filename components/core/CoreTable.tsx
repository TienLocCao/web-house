"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Column, SortItem } from "@/lib/types/table"
import { useTableSelection } from "@/hooks/useTableSelection"
import { CoreTableSkeleton } from "./CoreTableSkeleton"
import type { TableSelection } from "@/hooks/useTableSelection"

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
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void

  renderBulkActionBar?: (
    selection: TableSelection
  ) => React.ReactNode
}

export const CoreTable = <T extends { id: number }>({
  columns,
  data,
  total,
  page,
  limit,
  sort,
  isLoading = false,
  onPageChange,
  onSortChange,
  onEdit,
  onDelete,
  renderBulkActionBar,
}: CoreTableProps<T>) => {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const idsOnPage = React.useMemo(
    () => data.map((d) => d.id),
    [data]
  )

  const selection = useTableSelection(idsOnPage, total)

  /* ---------- SORT ---------- */
  const toggleSort = (key: string) => {
    if (isLoading) return

    const existing = sort.find((s) => s.key === key)
    let nextSort: SortItem[]

    if (!existing) {
      nextSort = [...sort, { key, direction: "asc" }]
    } else if (existing.direction === "asc") {
      nextSort = sort.map((s) =>
        s.key === key ? { ...s, direction: "desc" } : s
      )
    } else {
      nextSort = sort.filter((s) => s.key !== key)
    }

    onSortChange(nextSort)
  }

  const getSortIndex = (key: string) =>
    sort.findIndex((s) => s.key === key)

  const headerCheckboxState = () => {
    if (selection.mode === "all") return true
    if (selection.isIndeterminate) return "indeterminate"
    return selection.isPageAllSelected
  }

  return (
    <div className="space-y-4 relative">
      {/* Overlay loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center">
          <span className="animate-spin text-lg">⏳</span>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selection.selectedCount > 0 &&
        renderBulkActionBar?.(selection)}

      <Card className="pt-0">
        <CardContent className="p-0">
          {/* scroll container */}
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Checkbox column */}
                  <TableHead className="w-10 sticky left-0 bg-background z-10">
                    <Checkbox
                      checked={headerCheckboxState()}
                      onCheckedChange={(v) =>
                        selection.toggleSelectPage(v === true)
                      }
                      disabled={isLoading}
                    />
                  </TableHead>

                  {/* Data columns */}
                  {columns.map((col) => {
                    const sortIndex = getSortIndex(col.key as string)
                    const sortItem = sort[sortIndex]

                    return (
                      <TableHead
                        key={String(col.key)}
                        onClick={() =>
                          col.sortable &&
                          toggleSort(col.key as string)
                        }
                        className={cn(
                          col.sortable &&
                            !isLoading &&
                            "cursor-pointer select-none"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {col.header}
                          {sortItem && (
                            <span className="text-xs text-muted-foreground">
                              {sortItem.direction === "asc"
                                ? "↑"
                                : "↓"}
                              <sup>{sortIndex + 1}</sup>
                            </span>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}

                  {/* Actions */}
                  <TableHead className="text-right sticky right-0 bg-background z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <CoreTableSkeleton
                    rows={limit}
                    cols={columns.length + 2}
                  />
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
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/50"
                    >
                      {/* Row checkbox */}
                      <TableCell className="sticky left-0 bg-background z-10">
                        <Checkbox
                          checked={selection.isRowSelected(row.id)}
                          onCheckedChange={(v) =>
                            selection.toggleRow(row.id, v === true)
                          }
                        />
                      </TableCell>

                      {/* Data cells */}
                      {columns.map((col) => (
                        <TableCell key={String(col.key)}>
                          {col.render
                            ? col.render(row)
                            : String((row as any)[col.key])}
                        </TableCell>
                      ))}

                      {/* Actions cell */}
                      <TableCell className="text-right sticky right-0 bg-background z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onEdit?.(row)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete?.(row)}
                            >
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
          </div>

          {/* Cross-page select hint */}
          {selection.mode === "page" &&
            selection.isPageAllSelected &&
            total > data.length && (
              <div className="mt-2 text-sm text-muted-foreground px-4">
                Selected {data.length} items.
                <button
                  className="ml-2 underline"
                  onClick={selection.selectAllCrossPage}
                >
                  Select all {total} items
                </button>
              </div>
            )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t pt-4 mt-4 px-4">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} items
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
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((p) => (
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
