import { useEffect } from "react"
import type { RefObject } from "react"

export function useAnimateOnInView(
  containerRef: RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit,
  deps: any[] = [],
) {
  useEffect(() => {
    const root = containerRef?.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.classList.add("animate-fade-in-up")
            observer.unobserve(entry.target)
          }
        })
      },
      options ?? { threshold: 0.1 },
    )

    const elements = root.querySelectorAll(".observe-animate")
    elements.forEach((el) => observer.observe(el))
    // If the root itself should animate (has the class), observe it too
    if ((root as HTMLElement).classList.contains("observe-animate")) {
      observer.observe(root)
    }

    return () => observer.disconnect()
    // containerRef itself is stable; allow caller to pass additional deps
  }, [containerRef, ...(deps || [])])
}
