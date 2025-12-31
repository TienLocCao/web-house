"use client"

import { useEffect, useRef } from "react"

interface Options {
  enabled: boolean
  onLoadMore: () => void
}

export function useInfiniteScroll({ enabled, onLoadMore }: Options) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      {
        rootMargin: "200px", // preload sớm
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [enabled, onLoadMore])

  return ref
}
