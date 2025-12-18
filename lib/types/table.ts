export type SortOrder = "asc" | "desc"

export interface SortItem {
  key: string
  order: SortOrder
}

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  width?: number
  render?: (row: T) => React.ReactNode
}
