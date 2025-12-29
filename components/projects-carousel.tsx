"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/types/project"
import { AppImage } from "./ui/app-image"

type Props = {
  initialProjects: Project[]
}

export default function ProjectsCarousel({ initialProjects }: Props) {
  const projects = initialProjects ?? []
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [announce, setAnnounce] = useState<string>("")
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("animate-fade-in-up")
        })
      },
      { threshold: 0.1 },
    )

    const els = rootRef.current?.querySelectorAll(".observe-animate")
    els?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const displayed = useMemo(() => {
    if (!projects.length) return []
    const end = currentSlide + 2
    if (end <= projects.length) return projects.slice(currentSlide, end)
    return [...projects.slice(currentSlide), ...projects.slice(0, end - projects.length)]
  }, [projects, currentSlide])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = projects.length ? (prev + 2) % projects.length : 0
      setAnnounce(`Showing projects ${next + 1} - ${Math.min(next + 2, projects.length)}`)
      return next
    })
  }, [projects.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = projects.length ? (prev - 2 + projects.length) % projects.length : 0
      setAnnounce(`Showing projects ${next + 1} - ${Math.min(next + 2, projects.length)}`)
      return next
    })
  }, [projects.length])

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide()
      if (e.key === "ArrowLeft") prevSlide()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [nextSlide, prevSlide])

  if (!projects.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No projects found.</p>
      </div>
    )
  }

  return (
    <div className="relative" ref={rootRef}>
      <div aria-live="polite" className="sr-only" role="status">
        {announce}
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {displayed.map((project) => (
          <article key={project.id} className="observe-animate opacity-0 transition-opacity duration-500">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-primary/10 mb-4">
              <AppImage
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary-foreground bg-primary px-4 py-3 rounded-lg">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}
              {project.location && <p className="text-xs text-muted-foreground">📍 {project.location}</p>}
            </div>
          </article>
        ))}
      </div>

      {projects.length > 2 && (
        <div className="flex justify-end gap-2">
          <Button aria-label="Previous projects" variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-transparent">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button aria-label="Next projects" variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-transparent">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
