interface Props {
  count: number
  mode: 'page' | 'all'
  onClear: () => void
  onDelete: () => void
}

export function BulkDeleteBar({
  count,
  mode,
  onClear,
  onDelete,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded border p-3 bg-muted">
      <span className="text-sm">
        {count} items selected
        {mode === 'all' && ' (all pages)'}
      </span>

      <div className="space-x-2">
        <button onClick={onClear} className="underline text-sm">
          Clear
        </button>
        <button
          onClick={onDelete}
          className="rounded bg-red-600 px-3 py-1 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
