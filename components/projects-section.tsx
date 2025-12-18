"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/lib/use-projects"

export function ProjectsSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const { projects, isLoading } = useProjects(true, 6)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".observe-animate")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 2) % projects.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 2 + projects.length) % projects.length)
  }

  if (isLoading) {
    return (
      <section id="top-selling" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="top-selling" ref={sectionRef} className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 observe-animate opacity-0">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">Explore Our Projects</h2>
          <p className="text-muted-foreground max-w-2xl">
            Here are some of our latest projects. We have completed numerous transformations continuously, showcasing
            diverse styles and creative solutions.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="relative observe-animate opacity-0" style={{ animationDelay: "0.2s" }}>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {projects.slice(currentSlide, currentSlide + 2).map((project, index) => (
                <div key={project.id} className="transition-opacity duration-500">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-primary/10 mb-4">
                    <Image
                      src={project.image_url || "/placeholder.svg"}
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
                </div>
              ))}
            </div>

            {projects.length > 2 && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-transparent">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-transparent">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
