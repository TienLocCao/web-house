import {
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface TableSkeletonProps {
  rows: number
  cols: number
}

export function CoreTableSkeleton({ rows, cols }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-full animate-pulse bg-muted rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
