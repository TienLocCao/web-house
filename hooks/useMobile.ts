import { useEffect, useState } from "react"

/**
 * useIsMobile hook
 * Returns true when the viewport width is <= breakpoint (default 768px).
 * Safe for SSR (returns false on server).
 */
export function useIsMobile(breakpoint = 768) {
  const isClient = typeof window !== "undefined" && typeof window.matchMedia === "function"
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (!isClient) return false
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  })

  useEffect(() => {
    if (!isClient) return

    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // Some older browsers call with MediaQueryList, some with event
      // normalize to .matches
      // @ts-ignore
      setIsMobile(typeof e.matches === "boolean" ? e.matches : mq.matches)
    }

    // Prefer modern API but fall back to addListener for legacy
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler as EventListener)
    } else if (typeof mq.addListener === "function") {
      // legacy
      // @ts-ignore
      mq.addListener(handler)
    }

    // sync initial
    setIsMobile(mq.matches)

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handler as EventListener)
      } else if (typeof mq.removeListener === "function") {
        // @ts-ignore
        mq.removeListener(handler)
      }
    }
  }, [breakpoint, isClient])

  return isMobile
}

export default useIsMobile
