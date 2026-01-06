"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends React.ComponentProps<typeof Input> {
  onClear?: () => void
  showClearButton?: boolean
}

export function SearchInput({
  className,
  value,
  onClear,
  showClearButton,
  ...props
}: SearchInputProps) {
  const shouldShowClear = showClearButton ?? (value && String(value).length > 0)

  return (
    <div className={cn("relative", className)}>
      <Input
        value={value}
        className={cn("pr-8 transition-all", className)}
        {...props}
      />
      {shouldShowClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-neutral-400 opacity-70 transition-all hover:bg-neutral-100 hover:text-neutral-600 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}


