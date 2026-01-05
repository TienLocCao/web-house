import * as React from "react"
export type SelectionMode = 'none' | 'page' | 'all'


export interface TableSelection {
  mode: SelectionMode
  selectedIds: number[]
  excludedIds: number[]
  selectedCount: number
  isPageAllSelected: boolean
  isIndeterminate: boolean

  isRowSelected: (id: number) => boolean
  toggleRow: (id: number, checked: boolean) => void
  toggleSelectPage: (checked: boolean) => void
  selectAllCrossPage: () => void
  clear: () => void
}

export function useTableSelection(
  idsOnPage: number[],
  total: number
): TableSelection {
  const [mode, setMode] = React.useState<SelectionMode>('none')
  const [selectedIds, setSelectedIds] = React.useState<number[]>([])
  const [excludedIds, setExcludedIds] = React.useState<number[]>([])

  // ====== DERIVED ======
  const isPageAllSelected =
    idsOnPage.length > 0 &&
    idsOnPage.every((id) => selectedIds.includes(id))

  const isIndeterminate =
    selectedIds.length > 0 && !isPageAllSelected

  const selectedCount =
    mode === 'all'
      ? total - excludedIds.length
      : selectedIds.length

  // ====== HELPERS ======
  const isRowSelected = (id: number) => {
    if (mode === 'all') return !excludedIds.includes(id)
    return selectedIds.includes(id)
  }

  // ====== ACTIONS ======
  const toggleRow = (id: number, checked: boolean) => {
    setMode('page')
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  const toggleSelectPage = (checked: boolean) => {
    if (checked) {
      setMode('page')
      setSelectedIds(idsOnPage)
    } else {
      clear()
    }
  }

  const selectAllCrossPage = () => {
    setMode('all')
    setSelectedIds([])
    setExcludedIds([])
  }

  const clear = () => {
    setMode('none')
    setSelectedIds([])
    setExcludedIds([])
  }

  return {
    mode,
    selectedIds,
    excludedIds,
    selectedCount,
    isPageAllSelected,
    isIndeterminate,
    isRowSelected,
    toggleRow,
    toggleSelectPage,
    selectAllCrossPage,
    clear,
  }
}
