import { useEffect } from "react"
import type { RefObject } from "react"

export function useAnimateOnInView(
  containerRef: RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit,
  deps: any[] = [],
) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return
    }

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const el = entry.target as HTMLElement
          const animateClass = el.dataset.animate || 'animate-fade-in-up'
          if (animateClass) {
            el.classList.add(animateClass)
          }
          const delay = el.dataset.delay
          if (delay) {
            el.style.animationDelay = `${delay}ms`
          }
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: 0.1,
        ...options,
      },
    )

    const elements = container.querySelectorAll(".observe-animate")
    elements.forEach((el) => observer.observe(el))

    if (container.classList.contains("observe-animate")) {
      observer.observe(container)
    }

    return () => observer.disconnect()
  }, [...deps])
}
