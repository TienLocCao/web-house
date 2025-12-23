import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"

type Props = {
  count: number
  onDelete?: () => void
  onClear: () => void
}

export function BulkActionBar({ count, onDelete, onClear }: Props) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between bg-muted px-4 py-2 border rounded-md">
      <span className="text-sm">
        Đã chọn <strong>{count}</strong> dòng
      </span>

      <div className="flex gap-2">
        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={onClear}
        >
          <X className="mr-2 h-4 w-4" />
          Bỏ chọn
        </Button>
      </div>
    </div>
  )
}
