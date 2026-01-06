"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FilterBarProps {
  children: React.ReactNode
  onClear?: () => void
  showClearButton?: boolean
  className?: string
}

export function FilterBar({
  children,
  onClear,
  showClearButton = true,
  className,
}: FilterBarProps) {
  const hasClearButton = showClearButton && onClear

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 transition-colors",
        className
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-3">{children}</div>
      {hasClearButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="gap-2 text-neutral-600 hover:text-neutral-900"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}


