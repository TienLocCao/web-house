"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface StatusOption {
  value: string
  label: string
}

export interface StatusFilterProps {
  value?: string
  onChange: (value: string) => void
  options: StatusOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
}

const defaultOptions: StatusOption[] = [
  { value: "all", label: "All Statuses" },
]

export function StatusFilter({
  value = "all",
  onChange,
  options = defaultOptions,
  placeholder = "Select status",
  className,
  triggerClassName,
}: StatusFilterProps) {
  const allOptions = options[0]?.value === "all" ? options : [...defaultOptions, ...options]

  return (
    <div className={cn("w-full sm:w-[200px]", className)}>
      <Select value={value || "all"} onValueChange={onChange}>
        <SelectTrigger
          className={cn("w-full transition-all", triggerClassName)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
