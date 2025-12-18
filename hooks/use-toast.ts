import { useCallback, useState } from "react"

export type ToastType = "default" | "success" | "error" | "warning"

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number // ms, 0 = không auto close
  type?: ToastType
}

export interface Toast extends ToastOptions {
  id: number
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = toastId++

    setToasts((prev) => [...prev, { id, ...options }])

    if (options.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, options.duration ?? 3000)
    }
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}
