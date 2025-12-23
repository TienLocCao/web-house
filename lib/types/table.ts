export type SortDirection = 'asc' | 'desc'

export interface SortItem {
  key: string
  direction: SortDirection
}

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}
