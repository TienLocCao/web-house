import { useCallback, useMemo, useState } from "react"

export type SelectionMode = 'none' | 'page' | 'all'

export function useTableSelection(idsOnPage: number[]) {
  const [mode, setMode] = useState<SelectionMode>('none')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [excludedIds, setExcludedIds] = useState<number[]>([])

  const isRowSelected = (id: number) => {
    if (mode === 'all') return !excludedIds.includes(id)
    return selectedIds.includes(id)
  }

  const isPageAllSelected =
    idsOnPage.length > 0 &&
    idsOnPage.every(isRowSelected)

  const isIndeterminate =
    idsOnPage.some(isRowSelected) && !isPageAllSelected

  const toggleRow = (id: number, checked: boolean) => {
    if (mode === 'all') {
      setExcludedIds((prev) =>
        checked ? prev.filter((x) => x !== id) : [...prev, id]
      )
    } else {
      setSelectedIds((prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
      )
      setMode('page')
    }
  }

  const toggleSelectPage = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([])
      setMode('none')
      return
    }
    setSelectedIds(idsOnPage)
    setMode('page')
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
    selectedCount:
      mode === 'all'
        ? 'all'
        : selectedIds.length,
    isRowSelected,
    isPageAllSelected,
    isIndeterminate,
    toggleRow,
    toggleSelectPage,
    selectAllCrossPage,
    clear,
  }
}
